using PartZone.Shared.Kernel.Domain;

namespace PartZone.Marketing.Domain.Entities;

public sealed class CouponUsage : Entity<Guid>
{
    public Guid CouponId { get; private set; }
    public Guid UserId { get; private set; }
    public DateTime UsedAt { get; private set; }

    private CouponUsage() : base(Guid.Empty) { }

    public static CouponUsage Create(Guid couponId, Guid userId) =>
        new()
        {
            Id = Guid.NewGuid(),
            CouponId = couponId,
            UserId = userId,
            UsedAt = DateTime.UtcNow,
        };
}
