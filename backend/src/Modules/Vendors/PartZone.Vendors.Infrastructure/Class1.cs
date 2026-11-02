using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Vendors.Application;
using PartZone.Vendors.Domain;

namespace PartZone.Vendors.Infrastructure;

// ── Repository ────────────────────────────────────────────────────────────────

internal sealed class VendorRepository : IVendorRepository
{
    private readonly DbContext _ctx;
    public VendorRepository(DbContext ctx) => _ctx = ctx;

    public Task<Vendor?> GetByUserIdAsync(Guid userId, CancellationToken ct = default) =>
        _ctx.Set<Vendor>().FirstOrDefaultAsync(v => v.UserId == userId, ct);

    public Task<Vendor?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _ctx.Set<Vendor>().FirstOrDefaultAsync(v => v.Id == id, ct);

    public async Task<IReadOnlyList<Vendor>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _ctx.Set<Vendor>().OrderByDescending(v => v.CreatedAt).ToListAsync(ct);
        return list.AsReadOnly();
    }

    public void Add(Vendor vendor) => _ctx.Set<Vendor>().Add(vendor);
    public void Update(Vendor vendor) => _ctx.Set<Vendor>().Update(vendor);
    public Task SaveChangesAsync(CancellationToken ct = default) => _ctx.SaveChangesAsync(ct);
}

// ── EF Configuration ──────────────────────────────────────────────────────────

internal sealed class VendorConfiguration : IEntityTypeConfiguration<Vendor>
{
    public void Configure(EntityTypeBuilder<Vendor> builder)
    {
        builder.ToTable("Vendors", "vendors");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.CompanyName).HasMaxLength(300).IsRequired();
        builder.Property(v => v.TaxId).HasMaxLength(50);
        builder.Property(v => v.PhoneNumber).HasMaxLength(30);
        builder.Property(v => v.CommissionRate).HasPrecision(5, 4);
        builder.Property(v => v.Status).HasConversion<int>();
        builder.HasIndex(v => v.UserId).IsUnique();
    }
}

// ── DI ────────────────────────────────────────────────────────────────────────

public static class VendorsInfrastructureExtensions
{
    public static IServiceCollection AddVendorsInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IVendorRepository, VendorRepository>();
        return services;
    }
}
