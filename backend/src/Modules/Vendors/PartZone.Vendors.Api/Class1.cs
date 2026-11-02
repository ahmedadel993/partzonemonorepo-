using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Vendors.Application;
using PartZone.Vendors.Infrastructure;

namespace PartZone.Vendors.Api;

// ── Endpoints ─────────────────────────────────────────────────────────────────

internal static class VendorsEndpoints
{
    internal static async Task<IResult> RegisterAsync(
        RegisterVendorRequest req, ClaimsPrincipal user, IMediator mediator, CancellationToken ct)
    {
        var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await mediator.Send(
            new RegisterVendorCommand(userId, req.CompanyName, req.TaxId, req.PhoneNumber), ct);
        return result.IsSuccess
            ? Results.Ok(new { vendorId = result.Value })
            : Results.Problem(result.Error.Description, statusCode: StatusCodes.Status409Conflict);
    }

    internal static async Task<IResult> GetMyProfileAsync(
        ClaimsPrincipal user, IMediator mediator, CancellationToken ct)
    {
        var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await mediator.Send(new GetMyVendorProfileQuery(userId), ct);
        return result.IsSuccess
            ? (result.Value is null ? Results.NotFound() : Results.Ok(result.Value))
            : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> GetAllAsync(IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAllVendorsQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> ApproveAsync(
        Guid id, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new ApproveVendorCommand(id), ct);
        return result.IsSuccess ? Results.NoContent() : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> SuspendAsync(
        Guid id, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new SuspendVendorCommand(id), ct);
        return result.IsSuccess ? Results.NoContent() : Results.Problem(result.Error.Description);
    }
}

// ── Module registration ───────────────────────────────────────────────────────

public static class VendorsApiModule
{
    public static IServiceCollection AddVendorsModule(this IServiceCollection services)
    {
        services.AddVendorsInfrastructure();
        return services;
    }

    public static IEndpointRouteBuilder MapVendorsEndpoints(this IEndpointRouteBuilder app)
    {
        var vendorsGroup = app.MapGroup("/api/v1/vendors");
        vendorsGroup.MapPost("/register", VendorsEndpoints.RegisterAsync).RequireAuthorization();
        vendorsGroup.MapGet("/me", VendorsEndpoints.GetMyProfileAsync).RequireAuthorization();

        app.MapGet("/api/v1/admin/vendors", VendorsEndpoints.GetAllAsync)
            .RequireAuthorization("Admin");
        app.MapPut("/api/v1/admin/vendors/{id}/approve", VendorsEndpoints.ApproveAsync)
            .RequireAuthorization("Admin");
        app.MapPut("/api/v1/admin/vendors/{id}/suspend", VendorsEndpoints.SuspendAsync)
            .RequireAuthorization("Admin");

        return app;
    }
}

internal sealed record RegisterVendorRequest(string CompanyName, string? TaxId, string? PhoneNumber);
