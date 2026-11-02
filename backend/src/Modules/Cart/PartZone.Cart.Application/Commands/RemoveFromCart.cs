using PartZone.Cart.Application.DTOs;
using PartZone.Cart.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Cart.Application.Commands;

public sealed record RemoveFromCartCommand(Guid UserId, Guid CartItemId) : ICommand<CartDto>;

internal sealed class RemoveFromCartHandler(ICartRepository repo)
    : ICommandHandler<RemoveFromCartCommand, CartDto>
{
    public async Task<Result<CartDto>> Handle(RemoveFromCartCommand request, CancellationToken ct)
    {
        var cart = await repo.GetByUserIdAsync(request.UserId, ct);
        if (cart is null) return Result.Failure<CartDto>(Error.NotFound("Cart.NotFound", "Cart not found."));
        cart.RemoveItem(request.CartItemId);
        repo.Update(cart);
        await repo.SaveChangesAsync(ct);
        return Result.Success(CartMapper.ToDto(cart));
    }
}
