using CartEntity = PartZone.Cart.Domain.Entities.Cart;

namespace PartZone.Cart.Application.Interfaces;

public interface ICartRepository
{
    Task<CartEntity?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    void Add(CartEntity cart);
    void Update(CartEntity cart);
    Task SaveChangesAsync(CancellationToken ct = default);
}
