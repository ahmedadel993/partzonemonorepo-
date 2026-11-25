using MediatR;
using Microsoft.AspNetCore.Http;
using PartZone.Checkout.Application.Commands;
using PartZone.Checkout.Application.Queries;

namespace PartZone.Checkout.Api;

internal static class AdminOrdersEndpoints
{
    internal static async Task<IResult> GetAllOrdersAsync(IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAllOrdersQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> GetOrderByIdAsync(Guid id, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAdminOrderByIdQuery(id), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
    }

    internal static async Task<IResult> UpdateOrderStatusAsync(
        Guid id, UpdateStatusRequest req, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateOrderStatusCommand(id, req.Status), ct);
        return result.IsSuccess
            ? Results.NoContent()
            : result.Error.Code == "Order.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error.Description,
                    statusCode: StatusCodes.Status422UnprocessableEntity);
    }
}

internal sealed record UpdateStatusRequest(string Status);
