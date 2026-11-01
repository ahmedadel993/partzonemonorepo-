using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetBrandsQuery : IQuery<IReadOnlyList<BrandDto>>;

internal sealed class GetBrandsHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetBrandsQuery, IReadOnlyList<BrandDto>>
{
    public async Task<IReadOnlyList<BrandDto>> Handle(GetBrandsQuery request, CancellationToken ct)
    {
        var brands = await repo.GetBrandsAsync(ct);
        return brands.Select(b => new BrandDto(b.Id, b.Name, b.Slug, b.LogoUrl, b.IsActive)).ToList();
    }
}
