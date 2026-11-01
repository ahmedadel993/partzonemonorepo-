using PartZone.Shared.Kernel.Domain;

namespace PartZone.Catalog.Domain.Entities;

public sealed class ProductTranslation : Entity<Guid>
{
    public Guid ProductId { get; private set; }
    public string Locale { get; private set; } = default!;
    public string Name { get; private set; } = default!;
    public string? Description { get; private set; }

    private ProductTranslation() : base(Guid.Empty) { }

    public static ProductTranslation Create(Guid productId, string locale, string name, string? description) =>
        new() { Id = Guid.NewGuid(), ProductId = productId, Locale = locale, Name = name, Description = description };
}
