using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetProductByIdQuery(Guid Id) : IQuery<ProductDetailDto?>;

internal sealed class GetProductByIdHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetProductByIdQuery, ProductDetailDto?>
{
    public async Task<Result<ProductDetailDto?>> Handle(GetProductByIdQuery request, CancellationToken ct)
    {
        var p = await repo.GetProductByIdAsync(request.Id, ct);
        if (p is null) return Result.Success<ProductDetailDto?>(null);
        var brand = await repo.GetBrandByIdAsync(p.BrandId, ct);
        var category = await repo.GetCategoryByIdAsync(p.CategoryId, ct);
        return Result.Success<ProductDetailDto?>(GetProductBySlugHandler.MapDetail(p, brand, category));
    }
}
