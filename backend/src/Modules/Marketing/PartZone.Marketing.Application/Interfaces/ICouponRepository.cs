using PartZone.Marketing.Domain.Entities;

namespace PartZone.Marketing.Application.Interfaces;

public interface ICouponRepository
{
    Task<Coupon?> GetByCodeAsync(string code, CancellationToken ct);
    Task<IReadOnlyList<Coupon>> GetAllAsync(CancellationToken ct);
    Task<Coupon?> GetByIdAsync(Guid id, CancellationToken ct);
    void Add(Coupon coupon);
    void Update(Coupon coupon);
    void AddUsage(CouponUsage usage);
    Task<int> GetUserUsageCountAsync(Guid couponId, Guid userId, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
