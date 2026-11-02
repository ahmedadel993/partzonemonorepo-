using Microsoft.EntityFrameworkCore;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Catalog.Application.Queries;
using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Infrastructure;

internal sealed class CatalogReadRepository(DbContext db) : ICatalogReadRepository
{
    public Task<Brand?> GetBrandByIdAsync(Guid id, CancellationToken ct) =>
        db.Set<Brand>().AsNoTracking().FirstOrDefaultAsync(b => b.Id == id, ct);

    public Task<Brand?> GetBrandBySlugAsync(string slug, CancellationToken ct) =>
        db.Set<Brand>().AsNoTracking().FirstOrDefaultAsync(b => b.Slug == slug, ct);

    public async Task<IReadOnlyList<Brand>> GetBrandsAsync(CancellationToken ct) =>
        await db.Set<Brand>().AsNoTracking().OrderBy(b => b.Name).ToListAsync(ct);

    public Task<bool> BrandSlugExistsAsync(string slug, CancellationToken ct) =>
        db.Set<Brand>().AnyAsync(b => b.Slug == slug, ct);

    public Task<Category?> GetCategoryByIdAsync(Guid id, CancellationToken ct) =>
        db.Set<Category>().FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<Category?> GetCategoryBySlugAsync(string slug, CancellationToken ct) =>
        db.Set<Category>().AsNoTracking()
            .Include(c => c.Children)
            .FirstOrDefaultAsync(c => c.Slug == slug, ct);

    public async Task<IReadOnlyList<Category>> GetCategoriesAsync(CancellationToken ct) =>
        await db.Set<Category>().AsNoTracking()
            .Include(c => c.Children)
            .Where(c => c.ParentId == null)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(ct);

    public Task<Product?> GetProductBySlugAsync(string slug, CancellationToken ct) =>
        db.Set<Product>().AsNoTracking()
            .Include(p => p.Images)
            .Include(p => p.Translations)
            .Include(p => p.Fitments)
            .FirstOrDefaultAsync(p => p.Slug == slug, ct);

    public Task<Product?> GetProductByIdAsync(Guid id, CancellationToken ct) =>
        db.Set<Product>().AsNoTracking()
            .Include(p => p.Images)
            .Include(p => p.Translations)
            .Include(p => p.Fitments)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<bool> ProductSkuExistsAsync(string sku, CancellationToken ct) =>
        db.Set<Product>().AnyAsync(p => p.SKU == sku, ct);

    public Task<bool> ProductSlugExistsAsync(string slug, CancellationToken ct) =>
        db.Set<Product>().AnyAsync(p => p.Slug == slug, ct);

    public async Task<PagedResult<ProductSummaryDto>> GetProductsAsync(ProductFilter filter, CancellationToken ct)
    {
        var query = db.Set<Product>().AsNoTracking()
            .Include(p => p.Images)
            .Include(p => p.Translations)
            .AsQueryable();

        if (filter.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == filter.CategoryId.Value);
        if (filter.BrandId.HasValue)
            query = query.Where(p => p.BrandId == filter.BrandId.Value);
        if (!string.IsNullOrWhiteSpace(filter.Condition))
            query = query.Where(p => p.Condition.ToString() == filter.Condition);
        if (!string.IsNullOrWhiteSpace(filter.Q))
            query = query.Where(p =>
                p.SKU.Contains(filter.Q) ||
                p.OemNumber.Contains(filter.Q) ||
                p.Translations.Any(t => t.Name.Contains(filter.Q)));
        if (filter.VehicleModelId.HasValue)
            query = query.Where(p => p.Fitments.Any(f => f.VehicleModelId == filter.VehicleModelId.Value));

        var total = await query.CountAsync(ct);
        var skip = (filter.Page - 1) * filter.PageSize;
        var products = await query.OrderByDescending(p => p.CreatedAt)
            .Skip(skip).Take(filter.PageSize).ToListAsync(ct);

        var items = products.Select(p =>
        {
            var primaryImage = p.Images.FirstOrDefault(i => i.IsPrimary) ?? p.Images.FirstOrDefault();
            var nameTranslation = p.Translations.FirstOrDefault(t => t.Locale == "ar")
                               ?? p.Translations.FirstOrDefault();
            return new ProductSummaryDto(
                p.Id, p.SKU, p.Slug,
                nameTranslation?.Name ?? p.SKU,
                p.Condition.ToString(),
                p.Price.Amount, p.Price.Currency,
                p.Stock, p.IsPublished,
                primaryImage?.Url,
                string.Empty, string.Empty);
        }).ToList();

        return new PagedResult<ProductSummaryDto>(items, total, filter.Page, filter.PageSize);
    }

    public async Task<IReadOnlyList<VehicleMake>> GetVehicleMakesAsync(CancellationToken ct) =>
        await db.Set<VehicleMake>().AsNoTracking().OrderBy(m => m.Name).ToListAsync(ct);

    public async Task<IReadOnlyList<VehicleModel>> GetVehicleModelsByMakeAsync(Guid makeId, CancellationToken ct) =>
        await db.Set<VehicleModel>().AsNoTracking()
            .Where(m => m.VehicleMakeId == makeId)
            .OrderBy(m => m.Name).ToListAsync(ct);

    public async Task<IReadOnlyList<VehicleYearRange>> GetVehicleYearsByModelAsync(Guid modelId, CancellationToken ct) =>
        await db.Set<VehicleYearRange>().AsNoTracking()
            .Where(y => y.VehicleModelId == modelId)
            .OrderBy(y => y.YearFrom).ToListAsync(ct);
}
