using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using PartZone.StoreSettings.Application;
using PartZone.StoreSettings.Infrastructure;

namespace PartZone.StoreSettings.Api;

// ── Endpoints ─────────────────────────────────────────────────────────────────

internal static class StoreSettingsEndpoints
{
    internal static async Task<IResult> GetSettingsAsync(IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetStoreSettingsQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> UpdateSettingsAsync(
        Dictionary<string, string> body, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateStoreSettingsCommand(body), ct);
        return result.IsSuccess ? Results.NoContent() : Results.Problem(result.Error.Description);
    }
}

// ── Module registration ───────────────────────────────────────────────────────

public static class StoreSettingsApiModule
{
    public static IServiceCollection AddStoreSettingsModule(this IServiceCollection services)
    {
        services.AddStoreSettingsInfrastructure();
        return services;
    }

    public static IEndpointRouteBuilder MapStoreSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/admin/settings", StoreSettingsEndpoints.GetSettingsAsync)
            .RequireAuthorization("Admin");

        app.MapPut("/api/v1/admin/settings", StoreSettingsEndpoints.UpdateSettingsAsync)
            .RequireAuthorization("Admin");

        return app;
    }
}
