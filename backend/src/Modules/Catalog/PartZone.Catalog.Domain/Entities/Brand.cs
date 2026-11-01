using PartZone.Shared.Kernel.Domain;

namespace PartZone.Catalog.Domain.Entities;

public sealed class Brand : AggregateRoot<Guid>
{
    public string Name { get; private set; } = default!;
    public string Slug { get; private set; } = default!;
    public string? LogoUrl { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Brand() : base(Guid.Empty) { }

    public static Brand Create(string name, string slug) =>
        new() { Id = Guid.NewGuid(), Name = name, Slug = slug, IsActive = true, CreatedAt = DateTime.UtcNow };

    public void Update(string name, string? logoUrl) { Name = name; LogoUrl = logoUrl; }
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
