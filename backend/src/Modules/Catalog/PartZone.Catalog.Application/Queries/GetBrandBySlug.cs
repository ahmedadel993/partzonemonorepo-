using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetBrandBySlugQuery(string Slug) : IQuery<BrandDto?>;

internal sealed class GetBrandBySlugHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetBrandBySlugQuery, BrandDto?>
{
    public async Task<BrandDto?> Handle(GetBrandBySlugQuery request, CancellationToken ct)
    {
        var b = await repo.GetBrandBySlugAsync(request.Slug, ct);
        return b is null ? null : new BrandDto(b.Id, b.Name, b.Slug, b.LogoUrl, b.IsActive);
    }
}
