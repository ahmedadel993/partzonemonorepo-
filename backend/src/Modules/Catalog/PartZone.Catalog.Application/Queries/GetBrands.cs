using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetBrandsQuery : IQuery<IReadOnlyList<BrandDto>>;

internal sealed class GetBrandsHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetBrandsQuery, IReadOnlyList<BrandDto>>
{
    public async Task<Result<IReadOnlyList<BrandDto>>> Handle(GetBrandsQuery request, CancellationToken ct)
    {
        var brands = await repo.GetBrandsAsync(ct);
        return Result.Success<IReadOnlyList<BrandDto>>(
            brands.Select(b => new BrandDto(b.Id, b.Name, b.Slug, b.LogoUrl, b.IsActive)).ToList());
    }
}
