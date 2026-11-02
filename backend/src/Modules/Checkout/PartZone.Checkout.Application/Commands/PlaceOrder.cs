using FluentValidation;
using PartZone.Checkout.Application.DTOs;
using PartZone.Checkout.Application.Interfaces;
using PartZone.Checkout.Domain.Entities;
using PartZone.Checkout.Domain.ValueObjects;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Checkout.Application.Commands;

public sealed record PlaceOrderItemInput(
    Guid ProductId, string SKU, string Name, decimal UnitPrice, int Quantity, string? ImageUrl);

public sealed record ShippingAddressInput(
    string FullName, string Phone,
    string AddressLine1, string? AddressLine2,
    string City, string Governorate, string PostalCode);

public sealed record PlaceOrderCommand(
    Guid UserId,
    IReadOnlyList<PlaceOrderItemInput> Items,
    ShippingAddressInput ShippingAddress,
    string? CouponCode,
    decimal DiscountAmount,
    string? Notes) : ICommand<OrderConfirmationDto>;

public sealed class PlaceOrderValidator : AbstractValidator<PlaceOrderCommand>
{
    public PlaceOrderValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty();
        RuleFor(x => x.ShippingAddress).NotNull();
        RuleFor(x => x.ShippingAddress.FullName).NotEmpty();
        RuleFor(x => x.ShippingAddress.Phone).NotEmpty();
        RuleFor(x => x.ShippingAddress.AddressLine1).NotEmpty();
        RuleFor(x => x.ShippingAddress.City).NotEmpty();
        RuleFor(x => x.ShippingAddress.Governorate).NotEmpty();
        RuleFor(x => x.DiscountAmount).GreaterThanOrEqualTo(0);
    }
}

internal sealed class PlaceOrderHandler(IOrderRepository repo)
    : ICommandHandler<PlaceOrderCommand, OrderConfirmationDto>
{
    public async Task<Result<OrderConfirmationDto>> Handle(PlaceOrderCommand request, CancellationToken ct)
    {
        var shippingAddress = ShippingAddress.Create(
            request.ShippingAddress.FullName,
            request.ShippingAddress.Phone,
            request.ShippingAddress.AddressLine1,
            request.ShippingAddress.AddressLine2,
            request.ShippingAddress.City,
            request.ShippingAddress.Governorate,
            request.ShippingAddress.PostalCode);

        var itemTuples = request.Items.Select(i =>
            (i.ProductId, i.SKU, i.Name, i.UnitPrice, i.Quantity, i.ImageUrl));

        var order = Order.Create(
            request.UserId,
            itemTuples,
            shippingAddress,
            request.CouponCode,
            request.DiscountAmount,
            request.Notes);

        repo.Add(order);
        await repo.SaveChangesAsync(ct);

        return Result.Success(OrderMapper.ToConfirmation(order));
    }
}
