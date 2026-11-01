namespace PartZone.Catalog.Application.Queries;

public sealed record ProductFilter(
    Guid? CategoryId = null,
    Guid? BrandId = null,
    Guid? VehicleModelId = null,
    int? YearFrom = null,
    int? YearTo = null,
    string? Condition = null,
    string? Q = null,
    int Page = 1,
    int PageSize = 24);
