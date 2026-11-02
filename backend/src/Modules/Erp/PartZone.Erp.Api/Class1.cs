using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Builder;
using PartZone.Shared.Kernel.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Erp.Application;
using PartZone.Erp.Infrastructure;

namespace PartZone.Erp.Api;

// ── Endpoints ─────────────────────────────────────────────────────────────────

internal static class ErpEndpoints
{
    internal static async Task<IResult> GetInventoryAsync(
        int threshold, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetLowStockProductsQuery(threshold), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> GetAdjustmentHistoryAsync(
        IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetStockAdjustmentHistoryQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> CreateAdjustmentAsync(
        StockAdjustmentRequest req, ClaimsPrincipal user, IMediator mediator, CancellationToken ct)
    {
        var adminUserId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await mediator.Send(
            new CreateStockAdjustmentCommand(req.ProductId, req.Delta, req.Reason, adminUserId), ct);
        return result.IsSuccess
            ? Results.NoContent()
            : Results.Problem(result.Error.Description,
                statusCode: result.Error.Type == ErrorType.NotFound
                    ? StatusCodes.Status404NotFound
                    : StatusCodes.Status422UnprocessableEntity);
    }
}

// ── Module registration ───────────────────────────────────────────────────────

public static class ErpApiModule
{
    public static IServiceCollection AddErpModule(this IServiceCollection services)
    {
        services.AddErpInfrastructure();
        return services;
    }

    public static IEndpointRouteBuilder MapErpEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/admin/erp/inventory", ErpEndpoints.GetInventoryAsync)
            .RequireAuthorization("Admin");
        app.MapGet("/api/v1/admin/erp/adjustments", ErpEndpoints.GetAdjustmentHistoryAsync)
            .RequireAuthorization("Admin");
        app.MapPost("/api/v1/admin/erp/adjustments", ErpEndpoints.CreateAdjustmentAsync)
            .RequireAuthorization("Admin");
        return app;
    }
}

internal sealed record StockAdjustmentRequest(Guid ProductId, int Delta, string Reason);
