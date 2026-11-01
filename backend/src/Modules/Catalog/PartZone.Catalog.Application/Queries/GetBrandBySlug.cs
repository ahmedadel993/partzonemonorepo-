using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetBrandBySlugQuery(string Slug) : IQuery<BrandDto?>;

internal sealed class GetBrandBySlugHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetBrandBySlugQuery, BrandDto?>
{
    public async Task<Result<BrandDto?>> Handle(GetBrandBySlugQuery request, CancellationToken ct)
    {
        var b = await repo.GetBrandBySlugAsync(request.Slug, ct);
        return Result.Success<BrandDto?>(
            b is null ? null : new BrandDto(b.Id, b.Name, b.Slug, b.LogoUrl, b.IsActive));
    }
}
