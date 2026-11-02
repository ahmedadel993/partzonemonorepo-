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

    public bool IsLiveNow()
    {
        if (!IsActive) return false;
        var now = DateTime.UtcNow;
        if (ActiveFrom.HasValue && now < ActiveFrom.Value) return false;
        if (ActiveTo.HasValue && now > ActiveTo.Value) return false;
        return true;
    }
}
