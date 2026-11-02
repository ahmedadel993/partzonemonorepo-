using PartZone.Catalog.Application.Interfaces;
using PartZone.Catalog.Domain.Entities;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetProductBySlugQuery(string Slug) : IQuery<ProductDetailDto?>;

internal sealed class GetProductBySlugHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetProductBySlugQuery, ProductDetailDto?>
{
    public async Task<Result<ProductDetailDto?>> Handle(GetProductBySlugQuery request, CancellationToken ct)
    {
        var p = await repo.GetProductBySlugAsync(request.Slug, ct);
        if (p is null) return Result.Success<ProductDetailDto?>(null);
        var brand = await repo.GetBrandByIdAsync(p.BrandId, ct);
        var category = await repo.GetCategoryByIdAsync(p.CategoryId, ct);
        var modelNames = await LoadModelNamesAsync(repo, p.Fitments.Select(f => f.VehicleModelId), ct);
        return Result.Success<ProductDetailDto?>(MapDetail(p, brand, category, modelNames));
    }

    internal static async Task<Dictionary<Guid, string>> LoadModelNamesAsync(
        ICatalogReadRepository repo,
        IEnumerable<Guid> modelIds,
        CancellationToken ct)
    {
        var result = new Dictionary<Guid, string>();
        foreach (var id in modelIds.Distinct())
        {
            var m = await repo.GetVehicleModelByIdAsync(id, ct);
            if (m is not null) result[id] = m.Name;
        }
        return result;
    }

    internal static ProductDetailDto MapDetail(Product p, Brand? brand, Category? category,
        Dictionary<Guid, string>? modelNames = null)
    {
        var translation = p.Translations.FirstOrDefault(t => t.Locale == "ar")
                       ?? p.Translations.FirstOrDefault();
        return new ProductDetailDto(
            p.Id, p.SKU, p.OemNumber, p.Slug,
            translation?.Name ?? p.SKU,
            translation?.Description,
            p.Condition.ToString(),
            p.Price.Amount, p.Price.Currency,
            p.Stock, p.IsPublished, p.AvgRating, p.ReviewCount,
            new BrandDto(p.BrandId, brand?.Name ?? string.Empty, brand?.Slug ?? string.Empty, brand?.LogoUrl, brand?.IsActive ?? true),
            new CategoryDto(p.CategoryId, category?.Name ?? string.Empty, category?.Slug ?? string.Empty, category?.ImageUrl, category?.SortOrder ?? 0, category?.ParentId, []),
            p.Images.Select(i => new ProductImageDto(i.Id, i.Url, i.AltText, i.IsPrimary)).ToList(),
            p.Fitments.Select(f => new ProductFitmentDto(
                f.Id, f.VehicleModelId,
                modelNames?.GetValueOrDefault(f.VehicleModelId) ?? string.Empty,
                f.YearFrom, f.YearTo)).ToList());
    }
}
