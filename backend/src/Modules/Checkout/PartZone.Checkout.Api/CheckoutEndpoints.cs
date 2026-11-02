using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using PartZone.Checkout.Application.Commands;
using PartZone.Checkout.Application.Queries;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Checkout.Api;

internal static class CheckoutEndpoints
{
    internal static async Task<IResult> PlaceOrderAsync(
        ClaimsPrincipal user, PlaceOrderRequest req, IMediator mediator, CancellationToken ct)
    {
        var userId = GetUserId(user);
        var command = new PlaceOrderCommand(
            userId,
            req.Items.Select(i => new PlaceOrderItemInput(
                i.ProductId, i.SKU, i.Name, i.UnitPrice, i.Quantity, i.ImageUrl)).ToList().AsReadOnly(),
            new ShippingAddressInput(
                req.ShippingAddress.FullName, req.ShippingAddress.Phone,
                req.ShippingAddress.AddressLine1, req.ShippingAddress.AddressLine2,
                req.ShippingAddress.City, req.ShippingAddress.Governorate, req.ShippingAddress.PostalCode),
            req.CouponCode,
            req.DiscountAmount,
            req.Notes);
        var result = await mediator.Send(command, ct);
        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error.Description, statusCode: StatusCodes.Status422UnprocessableEntity);
    }

    internal static async Task<IResult> GetMyOrdersAsync(
        ClaimsPrincipal user, IMediator mediator, CancellationToken ct)
    {
        var userId = GetUserId(user);
        var result = await mediator.Send(new GetMyOrdersQuery(userId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> GetOrderByIdAsync(
        Guid id, ClaimsPrincipal user, IMediator mediator, CancellationToken ct)
    {
        var userId = GetUserId(user);
        var result = await mediator.Send(new GetOrderByIdQuery(id, userId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
    }

    internal static async Task<IResult> CancelOrderAsync(
        Guid id, ClaimsPrincipal user, IMediator mediator, CancellationToken ct)
    {
        var userId = GetUserId(user);
        var result = await mediator.Send(new CancelOrderCommand(id, userId), ct);
        return result.IsSuccess ? Results.NoContent()
            : result.Error.Code == "Checkout.OrderNotFound" ? Results.NotFound()
            : result.Error.Type == ErrorType.Unauthorized ? Results.Forbid()
            : Results.Problem(result.Error.Description,
                statusCode: StatusCodes.Status422UnprocessableEntity);
    }

    private static Guid GetUserId(ClaimsPrincipal user) =>
        Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
}

internal sealed record PlaceOrderItemRequest(
    Guid ProductId, string SKU, string Name, decimal UnitPrice, int Quantity, string? ImageUrl);

internal sealed record ShippingAddressRequest(
    string FullName, string Phone,
    string AddressLine1, string? AddressLine2,
    string City, string Governorate, string PostalCode);

internal sealed record PlaceOrderRequest(
    IReadOnlyList<PlaceOrderItemRequest> Items,
    ShippingAddressRequest ShippingAddress,
    string? CouponCode,
    decimal DiscountAmount,
    string? Notes);
