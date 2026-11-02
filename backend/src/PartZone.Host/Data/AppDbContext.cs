using MediatR;
using Microsoft.EntityFrameworkCore;
using CartEntity = PartZone.Cart.Domain.Entities.Cart;
using CartItemEntity = PartZone.Cart.Domain.Entities.CartItem;
using PartZone.Cart.Infrastructure;
using PartZone.Catalog.Domain.Entities;
using PartZone.Catalog.Infrastructure;
using PartZone.Checkout.Domain.Entities;
using PartZone.Checkout.Infrastructure;
using PartZone.Identity.Domain.Entities;
using PartZone.Identity.Infrastructure.Data;
using PartZone.Marketing.Domain.Entities;
using PartZone.Marketing.Infrastructure;
using PartZone.Orders.Infrastructure;
using PartZone.Shared.Kernel.Domain;
using PartZone.StoreSettings.Domain;
using PartZone.StoreSettings.Infrastructure;
using PartZone.Vendors.Domain;
using PartZone.Vendors.Infrastructure;
using PartZone.Erp.Domain;
using PartZone.Erp.Infrastructure;

namespace PartZone.Host.Data;

public sealed class AppDbContext : DbContext
{
    private readonly IMediator _mediator;

    public AppDbContext(DbContextOptions<AppDbContext> options, IMediator mediator) : base(options)
        => _mediator = mediator;

    // Identity
    public DbSet<User> Users => Set<User>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Marketing
    public DbSet<PageBlock> PageBlocks => Set<PageBlock>();
    public DbSet<PageBlockTranslation> PageBlockTranslations => Set<PageBlockTranslation>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<CouponUsage> CouponUsages => Set<CouponUsage>();

    // Catalog
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<VehicleMake> VehicleMakes => Set<VehicleMake>();
    public DbSet<VehicleModel> VehicleModels => Set<VehicleModel>();
    public DbSet<VehicleYearRange> VehicleYearRanges => Set<VehicleYearRange>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductTranslation> ProductTranslations => Set<ProductTranslation>();
    public DbSet<ProductFitment> ProductFitments => Set<ProductFitment>();

    // Cart
    public DbSet<CartEntity> Carts => Set<CartEntity>();
    public DbSet<CartItemEntity> CartItems => Set<CartItemEntity>();

    // Orders (owned by Checkout module)
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    // StoreSettings
    public DbSet<StoreSetting> StoreSettings => Set<StoreSetting>();

    // Vendors
    public DbSet<Vendor> Vendors => Set<Vendor>();

    // ERP
    public DbSet<StockAdjustment> StockAdjustments => Set<StockAdjustment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new AddressConfiguration());
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CatalogInfrastructureExtensions).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MarketingInfrastructureExtensions).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CartInfrastructureExtensions).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CheckoutInfrastructureExtensions).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrdersInfrastructureExtensions).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(StoreSettingsInfrastructureExtensions).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(VendorsInfrastructureExtensions).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ErpInfrastructureExtensions).Assembly);

        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var aggregates = ChangeTracker.Entries<AggregateRoot<Guid>>()
            .Where(e => e.Entity.DomainEvents.Count > 0)
            .Select(e => e.Entity)
            .ToList();

        var events = aggregates.SelectMany(a => a.DomainEvents).ToList();
        foreach (var agg in aggregates)
            agg.ClearDomainEvents();

        var result = await base.SaveChangesAsync(cancellationToken);

        foreach (var ev in events)
            await _mediator.Publish(ev, cancellationToken);

        return result;
    }
}
