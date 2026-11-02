namespace PartZone.Marketing.Application.DTOs;

public sealed record PageBlockTranslationDto(
    string Locale,
    string? Title,
    string? Subtitle,
    string? CtaText,
    string? ConfigOverride);

public sealed record PageBlockDto(
    Guid Id,
    string Type,
    int SortOrder,
    bool IsActive,
    string? ActiveFrom,
    string? ActiveTo,
    string Config,
    string BindingType,
    Guid? TargetId,
    string? TargetUrl,
    IReadOnlyList<PageBlockTranslationDto> Translations);

public sealed record ActivePageBlockDto(
    Guid Id,
    string Type,
    int SortOrder,
    string Config,
    string BindingType,
    Guid? TargetId,
    string? TargetUrl,
    IReadOnlyList<PageBlockTranslationDto> Translations);
