using PartZone.Checkout.Domain.Entities;

namespace PartZone.Checkout.Application.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    void Add(Order order);
    void Update(Order order);
    Task SaveChangesAsync(CancellationToken ct = default);
}
