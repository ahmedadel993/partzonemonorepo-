// Phase 6 – Dynamic payment methods
namespace PartZone.Marketing.Application.DTOs;

public sealed record PaymentMethodDto(
    Guid Id,
    string Key,
    string LabelAr,
    string LabelEn,
    string? IconUrl,
    bool IsActive,
    bool IsComingSoon,
    int SortOrder);
