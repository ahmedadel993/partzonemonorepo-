namespace PartZone.Catalog.Application.Queries;

public sealed record ProductSummaryDto(
    Guid Id,
    string SKU,
    string Slug,
    string Name,
    string Condition,
    decimal PriceAmount,
    string PriceCurrency,
    int Stock,
    bool IsPublished,
    string? PrimaryImageUrl,
    string BrandName,
    string CategoryName,
    Guid BrandId,
    Guid CategoryId);
