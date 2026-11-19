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

    public void Update(CartEntity cart)
    {
        // Disable auto-detect so Entry() calls below don't trigger DetectChanges mid-loop.
        // DetectChanges would see the new CartItem in _items and mark it Modified (not Added)
        // before we get a chance to explicitly mark it Added ourselves.
        _ctx.ChangeTracker.AutoDetectChangesEnabled = false;
        try
        {
            foreach (var item in cart.Items)
            {
                if (_ctx.Entry(item).State == EntityState.Detached)
                    _ctx.Entry(item).State = EntityState.Added;
            }
        }
        finally
        {
            _ctx.ChangeTracker.AutoDetectChangesEnabled = true;
        }
    }

    public Task SaveChangesAsync(CancellationToken ct) => _ctx.SaveChangesAsync(ct);
}
