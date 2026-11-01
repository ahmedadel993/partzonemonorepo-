using PartZone.Shared.Kernel.Domain;

namespace PartZone.Catalog.Domain.Entities;

public sealed class VehicleMake : AggregateRoot<Guid>
{
    public string Name { get; private set; } = default!;
    public string Slug { get; private set; } = default!;
    public string? LogoUrl { get; private set; }

    private readonly List<VehicleModel> _models = [];
    public IReadOnlyCollection<VehicleModel> Models => _models.AsReadOnly();

    private VehicleMake() : base(Guid.Empty) { }

    public static VehicleMake Create(string name, string slug) =>
        new() { Id = Guid.NewGuid(), Name = name, Slug = slug };

    public void Update(string name, string? logoUrl) { Name = name; LogoUrl = logoUrl; }
}
