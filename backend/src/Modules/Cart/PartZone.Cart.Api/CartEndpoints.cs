using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using PartZone.Cart.Application.Commands;
using PartZone.Cart.Application.Queries;

namespace PartZone.Cart.Api;

internal static class CartEndpoints
{
    internal static async Task<IResult> GetCartAsync(
        ClaimsPrincipal user, IMediator mediator, CancellationToken ct)
    {
        var userId = GetUserId(user);
        var result = await mediator.Send(new GetCartQuery(userId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> AddToCartAsync(
        ClaimsPrincipal user, AddToCartRequest req, IMediator mediator, CancellationToken ct)
    {
        var userId = GetUserId(user);
        var result = await mediator.Send(new AddToCartCommand(
            userId, req.ProductId, req.SKU, req.Name, req.UnitPrice, req.Quantity, req.ImageUrl), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> UpdateItemAsync(
        Guid itemId, ClaimsPrincipal user, UpdateItemRequest req, IMediator mediator, CancellationToken ct)
    {
        var userId = GetUserId(user);
        var result = await mediator.Send(new UpdateCartItemQuantityCommand(userId, itemId, req.Quantity), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> RemoveItemAsync(
        Guid itemId, ClaimsPrincipal user, IMediator mediator, CancellationToken ct)
    {
        var userId = GetUserId(user);
        var result = await mediator.Send(new RemoveFromCartCommand(userId, itemId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> ClearCartAsync(
        ClaimsPrincipal user, IMediator mediator, CancellationToken ct)
    {
        var userId = GetUserId(user);
        var result = await mediator.Send(new ClearCartCommand(userId), ct);
        return result.IsSuccess ? Results.NoContent() : Results.Problem(result.Error.Description);
    }

    private static Guid GetUserId(ClaimsPrincipal user) =>
        Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
}

internal sealed record AddToCartRequest(
    Guid ProductId, string SKU, string Name, decimal UnitPrice, int Quantity, string? ImageUrl);

internal sealed record UpdateItemRequest(int Quantity);
