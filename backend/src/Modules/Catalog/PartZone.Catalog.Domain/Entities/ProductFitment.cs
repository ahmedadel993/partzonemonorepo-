using PartZone.Shared.Kernel.Domain;

namespace PartZone.Catalog.Domain.Entities;

public sealed class ProductFitment : Entity<Guid>
{
    public Guid ProductId { get; private set; }
    public Guid VehicleModelId { get; private set; }
    public int YearFrom { get; private set; }
    public int YearTo { get; private set; }

    private ProductFitment() : base(Guid.Empty) { }

    public static ProductFitment Create(Guid productId, Guid modelId, int yearFrom, int yearTo) =>
        new() { Id = Guid.NewGuid(), ProductId = productId, VehicleModelId = modelId, YearFrom = yearFrom, YearTo = yearTo };
}
