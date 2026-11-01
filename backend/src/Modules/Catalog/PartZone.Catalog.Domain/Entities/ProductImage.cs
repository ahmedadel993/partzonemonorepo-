using PartZone.Shared.Kernel.Domain;

namespace PartZone.Catalog.Domain.Entities;

public sealed class ProductImage : Entity<Guid>
{
    public Guid ProductId { get; private set; }
    public string Url { get; private set; } = default!;
    public string AltText { get; private set; } = default!;
    public bool IsPrimary { get; internal set; }
    public int SortOrder { get; private set; }

    private ProductImage() : base(Guid.Empty) { }

    public static ProductImage Create(Guid productId, string url, string altText, bool isPrimary, int sortOrder) =>
        new() { Id = Guid.NewGuid(), ProductId = productId, Url = url, AltText = altText, IsPrimary = isPrimary, SortOrder = sortOrder };
}
