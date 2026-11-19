namespace PartZone.Catalog.Application.Queries;

public sealed record CategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? ImageUrl,
    int SortOrder,
    Guid? ParentId,
    bool IsActive,
    bool IsFeatured,
    bool ShowInHome,
    bool ShowInMenu,
    IReadOnlyList<CategoryDto> Children);
