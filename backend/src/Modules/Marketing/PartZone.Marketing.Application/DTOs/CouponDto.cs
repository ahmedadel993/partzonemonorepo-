namespace PartZone.Marketing.Application.DTOs;

public sealed record CouponDto(
    Guid Id,
    string Code,
    string DiscountType,
    decimal Value,
    decimal? MinOrderAmount,
    int UsageLimit,
    int PerUserLimit,
    int UsedCount,
    string ValidFrom,
    string ValidTo,
    bool IsActive);

public sealed record CouponValidationResult(
    bool IsValid,
    string? DiscountType,
    decimal? Value,
    string? ErrorCode);
