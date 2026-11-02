using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Checkout.Domain.Entities;
using PartZone.Orders.Application;

namespace PartZone.Orders.Infrastructure;

public sealed class OrderAdminRepository : IOrderAdminRepository
{
    private readonly DbContext _ctx;

    public OrderAdminRepository(DbContext ctx) => _ctx = ctx;

    public async Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct)
    {
        var list = await _ctx.Set<Order>()
            .Include(o => o.Items)
            .OrderByDescending(o => o.PlacedAt)
            .ToListAsync(ct);
        return list.AsReadOnly();
    }

    public Task<Order?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _ctx.Set<Order>()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

    public void Update(Order order) => _ctx.Set<Order>().Update(order);

    public Task SaveChangesAsync(CancellationToken ct) => _ctx.SaveChangesAsync(ct);
}

public static class OrdersInfrastructureExtensions
{
    public static IServiceCollection AddOrdersInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IOrderAdminRepository, OrderAdminRepository>();
        return services;
    }
}
