// Phase 6 – Dynamic payment methods
using PartZone.Marketing.Domain.Entities;

namespace PartZone.Marketing.Application.Interfaces;

public interface IPaymentMethodRepository
{
    Task<IReadOnlyList<PaymentMethod>> GetAllAsync(CancellationToken ct);
    Task<IReadOnlyList<PaymentMethod>> GetActiveAsync(CancellationToken ct);
    Task<PaymentMethod?> GetByIdAsync(Guid id, CancellationToken ct);
    void Add(PaymentMethod method);
    void Update(PaymentMethod method);
    void Remove(PaymentMethod method);
    Task SaveChangesAsync(CancellationToken ct);
}
