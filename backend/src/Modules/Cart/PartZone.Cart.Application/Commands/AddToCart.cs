using FluentValidation;
using PartZone.Cart.Application.DTOs;
using PartZone.Cart.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;
using CartEntity = PartZone.Cart.Domain.Entities.Cart;

namespace PartZone.Cart.Application.Commands;

public sealed record AddToCartCommand(
    Guid UserId, Guid ProductId, string SKU, string Name,
    decimal UnitPrice, int Quantity, string? ImageUrl) : ICommand<CartDto>;

public sealed class AddToCartValidator : AbstractValidator<AddToCartCommand>
{
    public AddToCartValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.SKU).NotEmpty();
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.UnitPrice).GreaterThan(0);
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}

internal sealed class AddToCartHandler(ICartRepository repo)
    : ICommandHandler<AddToCartCommand, CartDto>
{
    public async Task<Result<CartDto>> Handle(AddToCartCommand request, CancellationToken ct)
    {
        var cart = await repo.GetByUserIdAsync(request.UserId, ct);
        if (cart is null)
        {
            cart = CartEntity.Create(request.UserId);
            repo.Add(cart);
        }
        cart.AddItem(request.ProductId, request.SKU, request.Name, request.UnitPrice, request.Quantity, request.ImageUrl);
        repo.Update(cart);
        await repo.SaveChangesAsync(ct);
        return Result.Success(CartMapper.ToDto(cart));
    }
}
