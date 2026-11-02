using PartZone.Cart.Application.DTOs;
using PartZone.Cart.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;
using CartEntity = PartZone.Cart.Domain.Entities.Cart;

namespace PartZone.Cart.Application.Queries;

public sealed record GetCartQuery(Guid UserId) : IQuery<CartDto>;

internal sealed class GetCartHandler(ICartRepository repo)
    : IQueryHandler<GetCartQuery, CartDto>
{
    public async Task<Result<CartDto>> Handle(GetCartQuery request, CancellationToken ct)
    {
        var cart = await repo.GetByUserIdAsync(request.UserId, ct);
        if (cart is null)
        {
            cart = CartEntity.Create(request.UserId);
            repo.Add(cart);
            await repo.SaveChangesAsync(ct);
        }
        return Result.Success(CartMapper.ToDto(cart));
    }
}
