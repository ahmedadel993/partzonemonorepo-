using CartEntity = PartZone.Cart.Domain.Entities.Cart;

namespace PartZone.Cart.Application.DTOs;

public sealed record CartItemDto(
    Guid Id,
    Guid ProductId,
    string SKU,
    string Name,
    decimal UnitPrice,
    int Quantity,
    decimal SubTotal,
    string? ImageUrl);

public sealed record CartDto(
    Guid Id,
    Guid UserId,
    IReadOnlyList<CartItemDto> Items,
    decimal SubTotal,
    int ItemCount,
    string? CouponCode);

internal static class CartMapper
{
    internal static CartDto ToDto(CartEntity cart) => new(
        cart.Id,
        cart.UserId,
        cart.Items
            .Select(i => new CartItemDto(i.Id, i.ProductId, i.SKU, i.Name, i.UnitPrice, i.Quantity, i.SubTotal, i.ImageUrl))
            .ToList()
            .AsReadOnly(),
        cart.SubTotal,
        cart.ItemCount,
        cart.CouponCode);
}
