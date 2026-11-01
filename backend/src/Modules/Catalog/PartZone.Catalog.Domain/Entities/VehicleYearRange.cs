using PartZone.Shared.Kernel.Domain;

namespace PartZone.Catalog.Domain.Entities;

public sealed class VehicleYearRange : Entity<Guid>
{
    public Guid VehicleModelId { get; private set; }
    public int YearFrom { get; private set; }
    public int YearTo { get; private set; }

    private VehicleYearRange() : base(Guid.Empty) { }

    public static VehicleYearRange Create(Guid modelId, int yearFrom, int yearTo) =>
        new() { Id = Guid.NewGuid(), VehicleModelId = modelId, YearFrom = yearFrom, YearTo = yearTo };
}
