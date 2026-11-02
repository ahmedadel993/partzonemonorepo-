using Microsoft.EntityFrameworkCore;
using PartZone.Checkout.Application.Interfaces;
using PartZone.Checkout.Domain.Entities;

namespace PartZone.Checkout.Infrastructure;

public sealed class OrderRepository : IOrderRepository
{
    private readonly DbContext _ctx;

    public OrderRepository(DbContext ctx) => _ctx = ctx;

    public Task<Order?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _ctx.Set<Order>()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<IReadOnlyList<Order>> GetByUserIdAsync(Guid userId, CancellationToken ct)
    {
        var list = await _ctx.Set<Order>()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.PlacedAt)
            .ToListAsync(ct);
        return list.AsReadOnly();
    }

    public void Add(Order order) => _ctx.Set<Order>().Add(order);

    public void Update(Order order) => _ctx.Set<Order>().Update(order);

    public Task SaveChangesAsync(CancellationToken ct) => _ctx.SaveChangesAsync(ct);
}
