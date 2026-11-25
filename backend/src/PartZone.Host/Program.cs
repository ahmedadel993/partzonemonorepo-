using System.Text;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PartZone.Cart.Api;
using PartZone.Cart.Application.Commands;
using PartZone.Catalog.Api;
using PartZone.Catalog.Application.Queries;
using PartZone.Checkout.Api;
using PartZone.Checkout.Application.Commands;
using PartZone.Identity.Api;
using PartZone.Marketing.Api;
using PartZone.Marketing.Application.Queries;
using PartZone.Orders.Api;
using PartZone.Orders.Application;
using PartZone.StoreSettings.Api;
using PartZone.StoreSettings.Application;
using PartZone.Vendors.Api;
using PartZone.Vendors.Application;
using PartZone.Erp.Api;
using PartZone.Erp.Application;
using PartZone.Host.Data;
using PartZone.Host.Extensions;
using PartZone.Host.Middleware;
using PartZone.Identity.Application;
using PartZone.Identity.Application.Commands;
using PartZone.Identity.Infrastructure;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// ── Serilog ──────────────────────────────────────────────────────────────────
builder.Host.UseSerilog((ctx, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console());

// ── JWT Settings ─────────────────────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
    ?? throw new InvalidOperationException("Jwt settings are not configured.");

// ── Database ─────────────────────────────────────────────────────────────────
var connStr = builder.Configuration.GetConnectionString("Default") ?? "";
builder.Services.AddDbContext<AppDbContext>(opts =>
{
    if (connStr.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase))
        opts.UseSqlite(connStr);
    else
        opts.UseSqlServer(connStr);
});

builder.Services.AddScoped<DbContext>(sp => sp.GetRequiredService<AppDbContext>());

// ── GraphQL (HotChocolate — schema-first) ────────────────────────────────────
// Root schema: empty Query/Mutation extended by each module's SDL file.
// SECURITY: every mutation is an admin operation (the storefront uses REST),
// so the whole Mutation type requires the "Admin" policy.
var graphql = builder.Services
    .AddGraphQLServer()
    .AddAuthorization()
    .AddDocumentFromString(
        "type Query { _placeholder: Boolean } " +
        "type Mutation @authorize(policy: \"Admin\") { _placeholder: Boolean }")
    .AddResolver("Query", "_placeholder", _ => null)
    .AddResolver("Mutation", "_placeholder", _ => null)
    // Serialize Guid → ID in the standard dashed form (same as REST); the
    // HotChocolate default ("N", no dashes) fails client-side UUID validation.
    .AddTypeConverter<Guid, string>(g => g.ToString("D"))
    // Show real exception messages in GraphQL errors during development only.
    .ModifyRequestOptions(o => o.IncludeExceptionDetails = builder.Environment.IsDevelopment());

// ── Modules ───────────────────────────────────────────────────────────────────
builder.Services.AddIdentityModule(jwtSettings);
// NOTE: Registration order matters for HotChocolate SDL-first resolver binding.
// Identity must be registered first, then Marketing, then Catalog.
builder.Services.AddIdentityGqlModule(graphql);
builder.Services.AddMarketingModule(graphql);
builder.Services.AddCatalogModule(graphql);
builder.Services.AddCartModule();
builder.Services.AddCheckoutModule();
builder.Services.AddOrdersModule();
builder.Services.AddStoreSettingsModule();
builder.Services.AddVendorsModule();
builder.Services.AddErpModule();

// ── MediatR (all application assemblies) ────────────────────────────────────
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblies(
        typeof(RegisterUserCommand).Assembly,        // Identity.Application
        typeof(GetBrandsQuery).Assembly,             // Catalog.Application
        typeof(GetActivePageBlocksQuery).Assembly,   // Marketing.Application
        typeof(AddToCartCommand).Assembly,           // Cart.Application
        typeof(PlaceOrderCommand).Assembly,          // Checkout.Application
        typeof(GetAllOrdersQuery).Assembly,          // Orders.Application
        typeof(GetStoreSettingsQuery).Assembly,      // StoreSettings.Application
        typeof(RegisterVendorCommand).Assembly,      // Vendors.Application
        typeof(CreateStockAdjustmentCommand).Assembly // Erp.Application
    ));

// ── FluentValidation ─────────────────────────────────────────────────────────
builder.Services.AddValidatorsFromAssemblies([
    typeof(RegisterUserCommand).Assembly,
    typeof(GetBrandsQuery).Assembly,
    typeof(GetActivePageBlocksQuery).Assembly,
    typeof(AddToCartCommand).Assembly,
    typeof(PlaceOrderCommand).Assembly,
    typeof(GetAllOrdersQuery).Assembly,
    typeof(GetStoreSettingsQuery).Assembly,
    typeof(RegisterVendorCommand).Assembly,
    typeof(CreateStockAdjustmentCommand).Assembly,
]);

// ── Auth ─────────────────────────────────────────────────────────────────────
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        };
    });

builder.Services.AddAuthorization(opts =>
    opts.AddPolicy("Admin", policy => policy.RequireRole("Admin")));

// ── Exception handling ───────────────────────────────────────────────────────
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ── Health checks ────────────────────────────────────────────────────────────
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database");

// ── CORS ─────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins").Get<string[]>() ?? [];
if (builder.Environment.IsDevelopment())
    allowedOrigins = [..allowedOrigins, "http://localhost:5173", "http://localhost:3000"];

builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

var app = builder.Build();

// ── Migrations on startup (dev / feature-flag) ───────────────────────────────
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        if (connStr.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase))
            await db.Database.EnsureCreatedAsync();
        else if (builder.Configuration.GetValue<bool>("APPLY_MIGRATIONS"))
            await db.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        var startupLogger = app.Logger;
        startupLogger.LogError(ex, "Database migration failed on startup: {Message}", ex.Message);
    }
}

// ── Seed admin user if not present ───────────────────────────────────────────
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var hasher = scope.ServiceProvider.GetRequiredService<PartZone.Identity.Application.Interfaces.IPasswordHasher>();
    const string adminEmail = "admin@partzone.local";
    if (!db.Users.Any(u => u.Email == adminEmail))
    {
        var admin = PartZone.Identity.Domain.Entities.User.Create(
            adminEmail,
            hasher.Hash("Admin@12345"),
            "Admin", "PartZone",
            PartZone.Identity.Domain.Entities.UserRole.Admin);
        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }
}

// ── Seed payment methods if not present ──────────────────────────────────────
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!db.Set<PartZone.Marketing.Domain.Entities.PaymentMethod>().Any())
    {
        db.Set<PartZone.Marketing.Domain.Entities.PaymentMethod>().AddRange(
            PartZone.Marketing.Domain.Entities.PaymentMethod.Create(
                "cash_on_delivery", "الدفع عند الاستلام", "Cash on Delivery",
                null, isComingSoon: false, sortOrder: 1),
            PartZone.Marketing.Domain.Entities.PaymentMethod.Create(
                "visa", "بطاقة فيزا", "Visa Card",
                null, isComingSoon: true, sortOrder: 2)
        );
        await db.SaveChangesAsync();
    }
}

app.UseSerilogRequestLogging();
app.UseExceptionHandler();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

// ── Health ───────────────────────────────────────────────────────────────────
app.MapHealthChecks("/health");

// ── GraphQL ──────────────────────────────────────────────────────────────────
app.MapGraphQL();

// ── REST Endpoints ───────────────────────────────────────────────────────────
app.MapGroup("/api/v1").WithTags("v1");
app.MapIdentityEndpoints();
app.MapCatalogEndpoints();
app.MapMarketingEndpoints();
app.MapCartEndpoints();
app.MapCheckoutEndpoints();
app.MapOrdersAdminEndpoints();
app.MapStoreSettingsEndpoints();
app.MapVendorsEndpoints();
app.MapErpEndpoints();
app.MapUploadEndpoints();

app.UseStaticFiles();

// Admin SPA deep-link fallback — TanStack Router handles routing client-side
app.MapFallback("/admin/{**slug}", async (HttpContext ctx) =>
{
    var indexPath = System.IO.Path.Combine(
        app.Environment.WebRootPath ?? "wwwroot", "admin", "index.html");
    if (File.Exists(indexPath))
    {
        ctx.Response.ContentType = "text/html";
        await ctx.Response.SendFileAsync(indexPath);
    }
});

app.Run();
