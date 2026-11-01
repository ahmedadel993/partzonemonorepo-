using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetProductsQuery(ProductFilter Filter) : IQuery<PagedResult<ProductSummaryDto>>;

internal sealed class GetProductsHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetProductsQuery, PagedResult<ProductSummaryDto>>
{
    public async Task<Result<PagedResult<ProductSummaryDto>>> Handle(GetProductsQuery request, CancellationToken ct)
    {
        var result = await repo.GetProductsAsync(request.Filter, ct);
        return Result.Success(result);
    }
}
