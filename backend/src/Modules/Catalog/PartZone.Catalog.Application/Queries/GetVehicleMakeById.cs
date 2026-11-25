using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetVehicleMakeByIdQuery(Guid Id) : IQuery<VehicleMakeDto?>;

internal sealed class GetVehicleMakeByIdHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetVehicleMakeByIdQuery, VehicleMakeDto?>
{
    public async Task<Result<VehicleMakeDto?>> Handle(GetVehicleMakeByIdQuery request, CancellationToken ct)
    {
        var make = await repo.GetVehicleMakeByIdAsync(request.Id, ct);
        return Result.Success<VehicleMakeDto?>(make is null ? null
            : new VehicleMakeDto(make.Id, make.Name, make.Slug, make.LogoUrl));
    }
}
