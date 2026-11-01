namespace PartZone.Catalog.Application.Queries;

public sealed record ProductDetailDto(
    Guid Id,
    string SKU,
    string OemNumber,
    string Slug,
    string Name,
    string? Description,
    string Condition,
    decimal PriceAmount,
    string PriceCurrency,
    int Stock,
    bool IsPublished,
    float AvgRating,
    int ReviewCount,
    BrandDto Brand,
    CategoryDto Category,
    IReadOnlyList<ProductImageDto> Images,
    IReadOnlyList<ProductFitmentDto> Fitments);

public sealed record ProductImageDto(Guid Id, string Url, string AltText, bool IsPrimary);
public sealed record ProductFitmentDto(Guid Id, Guid ModelId, string ModelName, int YearFrom, int YearTo);
