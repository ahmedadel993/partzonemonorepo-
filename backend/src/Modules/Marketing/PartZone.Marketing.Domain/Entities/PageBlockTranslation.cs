using PartZone.Shared.Kernel.Domain;

namespace PartZone.Marketing.Domain.Entities;

public sealed class PageBlockTranslation : Entity<Guid>
{
    public Guid PageBlockId { get; private set; }
    public string Locale { get; private set; } = default!;
    public string? Title { get; private set; }
    public string? Subtitle { get; private set; }
    public string? CtaText { get; private set; }
    public string? ConfigOverride { get; private set; }

    private PageBlockTranslation() : base(Guid.Empty) { }

    public static PageBlockTranslation Create(
        Guid pageBlockId,
        string locale,
        string? title,
        string? subtitle,
        string? ctaText,
        string? configOverride = null) =>
        new()
        {
            Id = Guid.NewGuid(),
            PageBlockId = pageBlockId,
            Locale = locale,
            Title = title,
            Subtitle = subtitle,
            CtaText = ctaText,
            ConfigOverride = configOverride,
        };
}
