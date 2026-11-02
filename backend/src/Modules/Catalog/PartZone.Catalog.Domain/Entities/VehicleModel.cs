using PartZone.Shared.Kernel.Domain;

namespace PartZone.Catalog.Domain.Entities;

public sealed class VehicleModel : Entity<Guid>
{
    public Guid VehicleMakeId { get; private set; }
    public string Name { get; private set; } = default!;
    public string Slug { get; private set; } = default!;

    private readonly List<VehicleYearRange> _yearRanges = [];
    public IReadOnlyCollection<VehicleYearRange> YearRanges => _yearRanges.AsReadOnly();

    private VehicleModel() : base(Guid.Empty) { }

    public static VehicleModel Create(Guid makeId, string name, string slug) =>
        new() { Id = Guid.NewGuid(), VehicleMakeId = makeId, Name = name, Slug = slug };

    public void Update(string name) { Name = name; }
}
