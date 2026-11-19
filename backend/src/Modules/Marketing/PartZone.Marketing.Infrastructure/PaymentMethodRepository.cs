// Phase 6 – Dynamic payment methods
using Microsoft.EntityFrameworkCore;
using PartZone.Marketing.Application.Interfaces;
using PartZone.Marketing.Domain.Entities;

namespace PartZone.Marketing.Infrastructure;

internal sealed class PaymentMethodRepository(DbContext db) : IPaymentMethodRepository
{
    public async Task<IReadOnlyList<PaymentMethod>> GetAllAsync(CancellationToken ct) =>
        await db.Set<PaymentMethod>().AsNoTracking().OrderBy(m => m.SortOrder).ToListAsync(ct);

    public async Task<IReadOnlyList<PaymentMethod>> GetActiveAsync(CancellationToken ct) =>
        await db.Set<PaymentMethod>().AsNoTracking()
            .Where(m => m.IsActive)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(ct);

    public Task<PaymentMethod?> GetByIdAsync(Guid id, CancellationToken ct) =>
        db.Set<PaymentMethod>().FirstOrDefaultAsync(m => m.Id == id, ct);

    public void Add(PaymentMethod method)    => db.Set<PaymentMethod>().Add(method);
    public void Update(PaymentMethod method) => db.Set<PaymentMethod>().Update(method);
    public void Remove(PaymentMethod method) => db.Set<PaymentMethod>().Remove(method);

    public Task SaveChangesAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
}
