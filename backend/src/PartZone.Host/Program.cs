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
using PartZone.Host.Data;
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
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<DbContext>(sp => sp.GetRequiredService<AppDbContext>());

// ── GraphQL (HotChocolate — schema-first) ────────────────────────────────────
// Root schema: empty Query/Mutation extended by each module's SDL file.
var graphql = builder.Services
    .AddGraphQLServer()
    .AddDocumentFromString(
        "type Query { _placeholder: Boolean } type Mutation { _placeholder: Boolean }");

// ── Modules ───────────────────────────────────────────────────────────────────
builder.Services.AddIdentityModule(jwtSettings);
builder.Services.AddCatalogModule(graphql);
builder.Services.AddMarketingModule(graphql);
builder.Services.AddCartModule();
builder.Services.AddCheckoutModule();

// ── MediatR (all application assemblies) ────────────────────────────────────
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblies(
        typeof(RegisterUserCommand).Assembly,        // Identity.Application
        typeof(GetBrandsQuery).Assembly,             // Catalog.Application
        typeof(GetActivePageBlocksQuery).Assembly,   // Marketing.Application
        typeof(AddToCartCommand).Assembly,           // Cart.Application
        typeof(PlaceOrderCommand).Assembly           // Checkout.Application
    ));

// ── FluentValidation ─────────────────────────────────────────────────────────
builder.Services.AddValidatorsFromAssemblies([
    typeof(RegisterUserCommand).Assembly,
    typeof(GetBrandsQuery).Assembly,
    typeof(GetActivePageBlocksQuery).Assembly,
    typeof(AddToCartCommand).Assembly,
    typeof(PlaceOrderCommand).Assembly,
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

builder.Services.AddAuthorization();

// ── Exception handling ───────────────────────────────────────────────────────
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ── Health checks ────────────────────────────────────────────────────────────
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database");

// ── CORS (dev only) ──────────────────────────────────────────────────────────
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(opts =>
        opts.AddDefaultPolicy(policy =>
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()));
}

var app = builder.Build();

// ── Migrations on startup (dev / feature-flag) ───────────────────────────────
if (builder.Configuration.GetValue<bool>("APPLY_MIGRATIONS"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.UseSerilogRequestLogging();
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
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

// Serve admin SPA from wwwroot/admin (production — IIS handles SPA fallback)
app.UseStaticFiles();

app.Run();
