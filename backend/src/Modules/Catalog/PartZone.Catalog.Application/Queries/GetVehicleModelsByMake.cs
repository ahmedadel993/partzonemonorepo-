using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetVehicleModelsByMakeQuery(Guid MakeId) : IQuery<IReadOnlyList<VehicleModelDto>>;

internal sealed class GetVehicleModelsByMakeHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetVehicleModelsByMakeQuery, IReadOnlyList<VehicleModelDto>>
{
    public async Task<Result<IReadOnlyList<VehicleModelDto>>> Handle(GetVehicleModelsByMakeQuery request, CancellationToken ct)
    {
        var models = await repo.GetVehicleModelsByMakeAsync(request.MakeId, ct);
        return Result.Success<IReadOnlyList<VehicleModelDto>>(
            models.Select(m => new VehicleModelDto(m.Id, m.VehicleMakeId, m.Name, m.Slug)).ToList());
    }
}
