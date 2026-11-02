using Microsoft.EntityFrameworkCore;
using PartZone.Cart.Application.Interfaces;
using CartEntity = PartZone.Cart.Domain.Entities.Cart;
using CartItemEntity = PartZone.Cart.Domain.Entities.CartItem;

namespace PartZone.Cart.Infrastructure;

public sealed class CartRepository : ICartRepository
{
    private readonly DbContext _ctx;

    public CartRepository(DbContext ctx) => _ctx = ctx;

    public Task<CartEntity?> GetByUserIdAsync(Guid userId, CancellationToken ct) =>
        _ctx.Set<CartEntity>()
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

    public void Add(CartEntity cart) => _ctx.Set<CartEntity>().Add(cart);

    public void Update(CartEntity cart) => _ctx.Set<CartEntity>().Update(cart);

    public Task SaveChangesAsync(CancellationToken ct) => _ctx.SaveChangesAsync(ct);
}
