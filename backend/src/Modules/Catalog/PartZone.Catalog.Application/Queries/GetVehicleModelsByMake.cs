using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetVehicleModelsByMakeQuery(Guid MakeId) : IQuery<IReadOnlyList<VehicleModelDto>>;

internal sealed class GetVehicleModelsByMakeHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetVehicleModelsByMakeQuery, IReadOnlyList<VehicleModelDto>>
{
    public async Task<IReadOnlyList<VehicleModelDto>> Handle(GetVehicleModelsByMakeQuery request, CancellationToken ct)
    {
        var models = await repo.GetVehicleModelsByMakeAsync(request.MakeId, ct);
        return models.Select(m => new VehicleModelDto(m.Id, m.VehicleMakeId, m.Name, m.Slug)).ToList();
    }
}
