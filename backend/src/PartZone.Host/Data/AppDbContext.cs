using Microsoft.EntityFrameworkCore;
using PartZone.Catalog.Domain.Entities;
using PartZone.Catalog.Infrastructure;
using PartZone.Identity.Domain.Entities;
using PartZone.Identity.Infrastructure.Data;

namespace PartZone.Host.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Identity
    public DbSet<User> Users => Set<User>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new AddressConfiguration());
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CatalogModule).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
