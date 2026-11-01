using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetProductsQuery(ProductFilter Filter) : IQuery<PagedResult<ProductSummaryDto>>;

internal sealed class GetProductsHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetProductsQuery, PagedResult<ProductSummaryDto>>
{
    public Task<PagedResult<ProductSummaryDto>> Handle(GetProductsQuery request, CancellationToken ct) =>
        repo.GetProductsAsync(request.Filter, ct);
}
