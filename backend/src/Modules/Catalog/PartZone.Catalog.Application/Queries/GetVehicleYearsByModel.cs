using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetVehicleYearsByModelQuery(Guid ModelId) : IQuery<IReadOnlyList<VehicleYearRangeDto>>;

internal sealed class GetVehicleYearsByModelHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetVehicleYearsByModelQuery, IReadOnlyList<VehicleYearRangeDto>>
{
    public async Task<IReadOnlyList<VehicleYearRangeDto>> Handle(GetVehicleYearsByModelQuery request, CancellationToken ct)
    {
        var years = await repo.GetVehicleYearsByModelAsync(request.ModelId, ct);
        return years.Select(y => new VehicleYearRangeDto(y.Id, y.VehicleModelId, y.YearFrom, y.YearTo)).ToList();
    }
}
