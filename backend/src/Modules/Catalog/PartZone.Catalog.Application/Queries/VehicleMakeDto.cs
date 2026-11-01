namespace PartZone.Catalog.Application.Queries;

public sealed record VehicleMakeDto(Guid Id, string Name, string Slug, string? LogoUrl);
public sealed record VehicleModelDto(Guid Id, Guid MakeId, string Name, string Slug);
public sealed record VehicleYearRangeDto(Guid Id, Guid ModelId, int YearFrom, int YearTo);
