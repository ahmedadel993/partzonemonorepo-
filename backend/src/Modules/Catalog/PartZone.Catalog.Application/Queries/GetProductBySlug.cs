using PartZone.Catalog.Application.Interfaces;
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
        return Result.Success<ProductDetailDto?>(p is null ? null : MapDetail(p));
    }

    internal static ProductDetailDto MapDetail(PartZone.Catalog.Domain.Entities.Product p)
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
            new BrandDto(p.BrandId, string.Empty, string.Empty, null, true),
            new CategoryDto(p.CategoryId, string.Empty, string.Empty, null, 0, null, []),
            p.Images.Select(i => new ProductImageDto(i.Id, i.Url, i.AltText, i.IsPrimary)).ToList(),
            p.Fitments.Select(f => new ProductFitmentDto(f.Id, f.VehicleModelId, string.Empty, f.YearFrom, f.YearTo)).ToList());
    }
}
