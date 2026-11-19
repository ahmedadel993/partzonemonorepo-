namespace PartZone.Catalog.Application.Queries;

public sealed record BrandDto(
    Guid Id,
    string Name,
    string Slug,
    string? LogoUrl,
    bool IsActive,
    bool IsFeatured,
    bool ShowInHome,
    bool IsSponsored);
