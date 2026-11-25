using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetVehicleModelByIdQuery(Guid Id) : IQuery<VehicleModelDto?>;

internal sealed class GetVehicleModelByIdHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetVehicleModelByIdQuery, VehicleModelDto?>
{
    public async Task<Result<VehicleModelDto?>> Handle(GetVehicleModelByIdQuery request, CancellationToken ct)
    {
        var model = await repo.GetVehicleModelByIdAsync(request.Id, ct);
        return Result.Success<VehicleModelDto?>(model is null ? null
            : new VehicleModelDto(model.Id, model.VehicleMakeId, model.Name, model.Slug));
    }
}
