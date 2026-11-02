using Microsoft.EntityFrameworkCore;
using PartZone.Marketing.Application.Interfaces;
using PartZone.Marketing.Domain.Entities;

namespace PartZone.Marketing.Infrastructure;

internal sealed class CouponRepository(DbContext db) : ICouponRepository
{
    private DbSet<Coupon> Set => db.Set<Coupon>();
    private DbSet<CouponUsage> Usages => db.Set<CouponUsage>();

    public async Task<Coupon?> GetByCodeAsync(string code, CancellationToken ct) =>
        await Set.FirstOrDefaultAsync(c => c.Code == code, ct);

    public async Task<IReadOnlyList<Coupon>> GetAllAsync(CancellationToken ct) =>
        await Set.OrderByDescending(c => c.CreatedAt).ToListAsync(ct);

    public async Task<Coupon?> GetByIdAsync(Guid id, CancellationToken ct) =>
        await Set.FindAsync([id], ct);

    public void Add(Coupon coupon) => Set.Add(coupon);
    public void Update(Coupon coupon) => Set.Update(coupon);
    public void AddUsage(CouponUsage usage) => Usages.Add(usage);

    public async Task<int> GetUserUsageCountAsync(Guid couponId, Guid userId, CancellationToken ct) =>
        await Usages.CountAsync(u => u.CouponId == couponId && u.UserId == userId, ct);

    public async Task SaveChangesAsync(CancellationToken ct) => await db.SaveChangesAsync(ct);
}
