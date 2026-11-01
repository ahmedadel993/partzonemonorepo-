using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetVehicleMakesQuery : IQuery<IReadOnlyList<VehicleMakeDto>>;

internal sealed class GetVehicleMakesHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetVehicleMakesQuery, IReadOnlyList<VehicleMakeDto>>
{
    public async Task<Result<IReadOnlyList<VehicleMakeDto>>> Handle(GetVehicleMakesQuery request, CancellationToken ct)
    {
        var makes = await repo.GetVehicleMakesAsync(ct);
        return Result.Success<IReadOnlyList<VehicleMakeDto>>(
            makes.Select(m => new VehicleMakeDto(m.Id, m.Name, m.Slug, m.LogoUrl)).ToList());
    }
}
