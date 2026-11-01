using PartZone.Catalog.Application.Queries;
using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Application.Interfaces;

public interface ICatalogReadRepository
{
    Task<Brand?> GetBrandByIdAsync(Guid id, CancellationToken ct = default);
    Task<Brand?> GetBrandBySlugAsync(string slug, CancellationToken ct = default);
    Task<IReadOnlyList<Brand>> GetBrandsAsync(CancellationToken ct = default);
    Task<bool> BrandSlugExistsAsync(string slug, CancellationToken ct = default);

    Task<Category?> GetCategoryBySlugAsync(string slug, CancellationToken ct = default);
    Task<IReadOnlyList<Category>> GetCategoriesAsync(CancellationToken ct = default);

    Task<Product?> GetProductBySlugAsync(string slug, CancellationToken ct = default);
    Task<Product?> GetProductByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<ProductSummaryDto>> GetProductsAsync(ProductFilter filter, CancellationToken ct = default);
    Task<bool> ProductSkuExistsAsync(string sku, CancellationToken ct = default);
    Task<bool> ProductSlugExistsAsync(string slug, CancellationToken ct = default);

    Task<IReadOnlyList<VehicleMake>> GetVehicleMakesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<VehicleModel>> GetVehicleModelsByMakeAsync(Guid makeId, CancellationToken ct = default);
    Task<IReadOnlyList<VehicleYearRange>> GetVehicleYearsByModelAsync(Guid modelId, CancellationToken ct = default);
}
