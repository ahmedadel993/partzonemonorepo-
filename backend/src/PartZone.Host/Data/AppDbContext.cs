using Microsoft.EntityFrameworkCore;
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new AddressConfiguration());
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());

        base.OnModelCreating(modelBuilder);
    }
}
