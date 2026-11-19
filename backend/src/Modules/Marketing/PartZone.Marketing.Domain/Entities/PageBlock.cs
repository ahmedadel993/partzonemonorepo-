using PartZone.Marketing.Domain.Enums;
using PartZone.Shared.Kernel.Domain;

namespace PartZone.Marketing.Domain.Entities;

public sealed class PageBlock : AggregateRoot<Guid>
{
    public PageBlockType Type { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? ActiveFrom { get; private set; }
    public DateTime? ActiveTo { get; private set; }
    public string Config { get; private set; } = default!;
    public BindingType BindingType { get; private set; }
    public Guid? TargetId { get; private set; }
    public string? TargetUrl { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private readonly List<PageBlockTranslation> _translations = [];
    public IReadOnlyList<PageBlockTranslation> Translations => _translations.AsReadOnly();

    private PageBlock() : base(Guid.Empty) { }

    public static PageBlock Create(
        PageBlockType type,
        int sortOrder,
        string config,
        BindingType bindingType = BindingType.None,
        Guid? targetId = null,
        string? targetUrl = null,
        DateTime? activeFrom = null,
        DateTime? activeTo = null) =>
        new()
        {
            Id = Guid.NewGuid(),
            Type = type,
            SortOrder = sortOrder,
            Config = config,
            BindingType = bindingType,
            TargetId = targetId,
            TargetUrl = targetUrl,
            ActiveFrom = activeFrom,
            ActiveTo = activeTo,
            IsActive = false,
            CreatedAt = DateTime.UtcNow,
        };

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void UpdateConfig(string config) => Config = config;

    /// <summary>Sets the optional live window (UTC). Null = no limit.</summary>
    public void UpdateSchedule(DateTime? activeFromUtc, DateTime? activeToUtc)
    {
        ActiveFrom = activeFromUtc;
        ActiveTo = activeToUtc;
    }

    public void UpdateBinding(BindingType bindingType, Guid? targetId, string? targetUrl)
    {
        BindingType = bindingType;
        TargetId = targetId;
        TargetUrl = targetUrl;
    }

    public void Reorder(int sortOrder) => SortOrder = sortOrder;

    public void SetTranslations(IEnumerable<PageBlockTranslation> translations)
    {
        _translations.Clear();
        _translations.AddRange(translations);
    }

    /// <summary>
    /// Syncs translations by locale: updates existing rows in place, removes
    /// locales not in <paramref name="incoming"/>, and adds new ones.
    /// Returns the newly added translations (the caller must register them as
    /// inserts — their client-generated keys would otherwise look like existing rows).
    /// </summary>
    public IReadOnlyList<PageBlockTranslation> SyncTranslations(IReadOnlyList<PageBlockTranslation> incoming)
    {
        var added = new List<PageBlockTranslation>();
        _translations.RemoveAll(t => incoming.All(i => i.Locale != t.Locale));

        foreach (var item in incoming)
        {
            var existing = _translations.FirstOrDefault(t => t.Locale == item.Locale);
            if (existing is not null)
            {
                existing.Update(item.Title, item.Subtitle, item.CtaText, item.ConfigOverride);
            }
            else
            {
                _translations.Add(item);
                added.Add(item);
            }
        }
        return added;
    }

    public bool IsLiveNow()
    {
        if (!IsActive) return false;
        var now = DateTime.UtcNow;
        if (ActiveFrom.HasValue && now < ActiveFrom.Value) return false;
        if (ActiveTo.HasValue && now > ActiveTo.Value) return false;
        return true;
    }
}
