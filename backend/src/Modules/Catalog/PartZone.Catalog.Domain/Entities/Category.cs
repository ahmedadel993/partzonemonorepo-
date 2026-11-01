using PartZone.Shared.Kernel.Domain;

namespace PartZone.Catalog.Domain.Entities;

public sealed class Category : AggregateRoot<Guid>
{
    public string Name { get; private set; } = default!;
    public string Slug { get; private set; } = default!;
    public string? ImageUrl { get; private set; }
    public int SortOrder { get; private set; }
    public Guid? ParentId { get; private set; }

    private readonly List<Category> _children = [];
    public IReadOnlyCollection<Category> Children => _children.AsReadOnly();

    private Category() : base(Guid.Empty) { }

    public static Category Create(string name, string slug, Guid? parentId = null, int sortOrder = 0) =>
        new() { Id = Guid.NewGuid(), Name = name, Slug = slug, ParentId = parentId, SortOrder = sortOrder };

    public void Update(string name, string? imageUrl, int sortOrder)
    {
        Name = name;
        ImageUrl = imageUrl;
        SortOrder = sortOrder;
    }
}
