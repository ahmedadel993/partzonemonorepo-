// Phase 6 – Dynamic payment methods
using PartZone.Shared.Kernel.Domain;

namespace PartZone.Marketing.Domain.Entities;

public sealed class PaymentMethod : AggregateRoot<Guid>
{
    public string Key         { get; private set; } = default!;
    public string LabelAr     { get; private set; } = default!;
    public string LabelEn     { get; private set; } = default!;
    public string? IconUrl    { get; private set; }
    public bool   IsActive    { get; private set; }
    public bool   IsComingSoon { get; private set; }
    public int    SortOrder   { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private PaymentMethod() : base(Guid.Empty) { }

    public static PaymentMethod Create(
        string key, string labelAr, string labelEn,
        string? iconUrl, bool isComingSoon, int sortOrder) =>
        new()
        {
            Id = Guid.NewGuid(),
            Key = key,
            LabelAr = labelAr,
            LabelEn = labelEn,
            IconUrl = iconUrl,
            IsActive = true,
            IsComingSoon = isComingSoon,
            SortOrder = sortOrder,
            CreatedAt = DateTime.UtcNow,
        };

    public void Update(string labelAr, string labelEn, string? iconUrl, bool isComingSoon, int sortOrder)
    {
        LabelAr     = labelAr;
        LabelEn     = labelEn;
        IconUrl     = iconUrl;
        IsComingSoon = isComingSoon;
        SortOrder   = sortOrder;
    }

    public void Reorder(int sortOrder) => SortOrder = sortOrder;

    public void Activate()   => IsActive = true;
    public void Deactivate() => IsActive = false;
}
