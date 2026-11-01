using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetBrandByIdQuery(Guid Id) : IQuery<BrandDto?>;

internal sealed class GetBrandByIdHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetBrandByIdQuery, BrandDto?>
{
    public async Task<Result<BrandDto?>> Handle(GetBrandByIdQuery request, CancellationToken ct)
    {
        var brand = await repo.GetBrandByIdAsync(request.Id, ct);
        return Result.Success<BrandDto?>(brand is null ? null
            : new BrandDto(brand.Id, brand.Name, brand.Slug, brand.LogoUrl, brand.IsActive));
    }
}
