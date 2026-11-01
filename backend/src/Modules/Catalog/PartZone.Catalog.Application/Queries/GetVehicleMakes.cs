using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetVehicleMakesQuery : IQuery<IReadOnlyList<VehicleMakeDto>>;

internal sealed class GetVehicleMakesHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetVehicleMakesQuery, IReadOnlyList<VehicleMakeDto>>
{
    public async Task<IReadOnlyList<VehicleMakeDto>> Handle(GetVehicleMakesQuery request, CancellationToken ct)
    {
        var makes = await repo.GetVehicleMakesAsync(ct);
        return makes.Select(m => new VehicleMakeDto(m.Id, m.Name, m.Slug, m.LogoUrl)).ToList();
    }
}
