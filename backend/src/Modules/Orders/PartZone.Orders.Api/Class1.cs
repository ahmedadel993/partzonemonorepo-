using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Orders.Application;
using PartZone.Orders.Infrastructure;

namespace PartZone.Orders.Api;

public static class OrdersAdminModule
{
    public static IServiceCollection AddOrdersModule(this IServiceCollection services)
    {
        services.AddOrdersInfrastructure();
        return services;
    }

    public static IEndpointRouteBuilder MapOrdersAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin/orders")
            .RequireAuthorization("Admin");

        group.MapGet("/", OrdersAdminEndpoints.GetAllOrdersAsync);
        group.MapGet("/{id:guid}", OrdersAdminEndpoints.GetOrderDetailAsync);
        group.MapPut("/{id:guid}/status", OrdersAdminEndpoints.UpdateOrderStatusAsync);

        return app;
    }
}

internal static class OrdersAdminEndpoints
{
    internal static async Task<IResult> GetAllOrdersAsync(
        IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAllOrdersQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> GetOrderDetailAsync(
        Guid id, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetOrderAdminDetailQuery(id), ct);
        if (!result.IsSuccess) return Results.Problem(result.Error.Description);
        return result.Value is null ? Results.NotFound() : Results.Ok(result.Value);
    }

    internal static async Task<IResult> UpdateOrderStatusAsync(
        Guid id, UpdateStatusRequest req, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateOrderStatusCommand(id, req.Status), ct);
        return result.IsSuccess
            ? Results.NoContent()
            : Results.Problem(result.Error.Description,
                statusCode: result.Error.Code == "Orders.NotFound"
                    ? StatusCodes.Status404NotFound
                    : StatusCodes.Status422UnprocessableEntity);
    }
}

internal sealed record UpdateStatusRequest(string Status);
