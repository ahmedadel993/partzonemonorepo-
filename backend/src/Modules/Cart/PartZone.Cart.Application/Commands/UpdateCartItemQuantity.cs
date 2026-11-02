using PartZone.Cart.Application.DTOs;
using PartZone.Cart.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Cart.Application.Commands;

public sealed record UpdateCartItemQuantityCommand(Guid UserId, Guid CartItemId, int Quantity) : ICommand<CartDto>;

internal sealed class UpdateCartItemQuantityHandler(ICartRepository repo)
    : ICommandHandler<UpdateCartItemQuantityCommand, CartDto>
{
    public async Task<Result<CartDto>> Handle(UpdateCartItemQuantityCommand request, CancellationToken ct)
    {
        var cart = await repo.GetByUserIdAsync(request.UserId, ct);
        if (cart is null) return Result.Failure<CartDto>(Error.NotFound("Cart.NotFound", "Cart not found."));
        cart.UpdateItemQuantity(request.CartItemId, request.Quantity);
        repo.Update(cart);
        await repo.SaveChangesAsync(ct);
        return Result.Success(CartMapper.ToDto(cart));
    }
}
