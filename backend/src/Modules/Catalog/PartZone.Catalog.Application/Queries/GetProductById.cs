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
        return Result.Success<ProductDetailDto?>(p is null ? null : GetProductBySlugHandler.MapDetail(p));
    }
}
