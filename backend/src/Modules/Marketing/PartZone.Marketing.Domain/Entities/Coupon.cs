using PartZone.Marketing.Domain.Enums;
using PartZone.Shared.Kernel.Domain;

namespace PartZone.Marketing.Domain.Entities;

public sealed class Coupon : AggregateRoot<Guid>
{
    public string Code { get; private set; } = default!;
    public DiscountType DiscountType { get; private set; }
    public decimal Value { get; private set; }
    public decimal? MinOrderAmount { get; private set; }
    public int UsageLimit { get; private set; }
    public int PerUserLimit { get; private set; }
    public int UsedCount { get; private set; }
    public DateTime ValidFrom { get; private set; }
    public DateTime ValidTo { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Coupon() : base(Guid.Empty) { }

    public static Coupon Create(
        string code,
        DiscountType discountType,
        decimal value,
        decimal? minOrderAmount,
        int usageLimit,
        int perUserLimit,
        DateTime validFrom,
        DateTime validTo) =>
        new()
        {
            Id = Guid.NewGuid(),
            Code = code.ToUpperInvariant(),
            DiscountType = discountType,
            Value = value,
            MinOrderAmount = minOrderAmount,
            UsageLimit = usageLimit,
            PerUserLimit = perUserLimit,
            ValidFrom = validFrom,
            ValidTo = validTo,
            UsedCount = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

    public void Deactivate() => IsActive = false;

    public void IncrementUsage() => UsedCount++;

    public void Update(
        DiscountType discountType,
        decimal value,
        decimal? minOrderAmount,
        int usageLimit,
        int perUserLimit,
        DateTime validFrom,
        DateTime validTo,
        bool isActive)
    {
        DiscountType = discountType;
        Value = value;
        MinOrderAmount = minOrderAmount;
        UsageLimit = usageLimit;
        PerUserLimit = perUserLimit;
        ValidFrom = validFrom;
        ValidTo = validTo;
        IsActive = isActive;
    }

    public bool IsValidNow()
    {
        if (!IsActive) return false;
        var now = DateTime.UtcNow;
        if (now < ValidFrom || now > ValidTo) return false;
        if (UsageLimit > 0 && UsedCount >= UsageLimit) return false;
        return true;
    }
}
