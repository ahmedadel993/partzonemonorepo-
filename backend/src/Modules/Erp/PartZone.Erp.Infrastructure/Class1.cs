using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Catalog.Domain.Entities;
using PartZone.Erp.Application;
using PartZone.Erp.Domain;

namespace PartZone.Erp.Infrastructure;

// ── Stock adjustment repository ───────────────────────────────────────────────

internal sealed class StockAdjustmentRepository : IErpRepository
{
    private readonly DbContext _ctx;
    public StockAdjustmentRepository(DbContext ctx) => _ctx = ctx;

    public void AddAdjustment(StockAdjustment adj) => _ctx.Set<StockAdjustment>().Add(adj);

    public async Task<IReadOnlyList<StockAdjustment>> GetAdjustmentsAsync(CancellationToken ct = default)
        => await _ctx.Set<StockAdjustment>().OrderByDescending(a => a.AdjustedAt).ToListAsync(ct);

    public Task SaveChangesAsync(CancellationToken ct = default) => _ctx.SaveChangesAsync(ct);
}

// ── Inventory product repository ──────────────────────────────────────────────

internal sealed class InventoryProductRepository : IInventoryProductRepository
{
    private readonly DbContext _ctx;
    public InventoryProductRepository(DbContext ctx) => _ctx = ctx;

    public async Task<IReadOnlyList<LowStockProductDto>> GetLowStockAsync(int threshold, CancellationToken ct = default)
    {
        var products = await _ctx.Set<Product>()
            .Include(p => p.Translations)
            .Where(p => p.Stock <= threshold)
            .OrderBy(p => p.Stock)
            .ToListAsync(ct);

        var items = products.Select(p => new LowStockProductDto(
            p.Id,
            p.SKU,
            p.Translations.FirstOrDefault(t => t.Locale == "ar")?.Name
                ?? p.Translations.FirstOrDefault()?.Name
                ?? p.Slug,
            p.Stock)).ToList();
        return items.AsReadOnly();
    }

    public async Task<int?> GetCurrentStockAsync(Guid productId, CancellationToken ct = default)
    {
        var product = await _ctx.Set<Product>().FirstOrDefaultAsync(p => p.Id == productId, ct);
        return product?.Stock;
    }

    public async Task UpdateStockAsync(Guid productId, int newStock, CancellationToken ct = default)
    {
        var product = await _ctx.Set<Product>().FirstOrDefaultAsync(p => p.Id == productId, ct);
        if (product is not null)
            product.UpdateStock(newStock);
    }
}

// ── EF Configuration ──────────────────────────────────────────────────────────

internal sealed class StockAdjustmentConfiguration : IEntityTypeConfiguration<StockAdjustment>
{
    public void Configure(EntityTypeBuilder<StockAdjustment> builder)
    {
        builder.ToTable("StockAdjustments", "erp");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Reason).HasMaxLength(500).IsRequired();
    }
}

// ── DI ────────────────────────────────────────────────────────────────────────

public static class ErpInfrastructureExtensions
{
    public static IServiceCollection AddErpInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IErpRepository, StockAdjustmentRepository>();
        services.AddScoped<IInventoryProductRepository, InventoryProductRepository>();
        return services;
    }
}
