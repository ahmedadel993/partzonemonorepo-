using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using PartZone.Identity.Application.Commands;
using PartZone.Identity.Application.Interfaces;
using PartZone.Identity.Application.Queries;
using PartZone.Identity.Domain.Entities;

namespace PartZone.Identity.Api;

internal static class IdentityEndpoints
{
    internal static async Task<IResult> RegisterAsync(
        RegisterRequest req, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new RegisterUserCommand(req.Email, req.Password, req.FirstName, req.LastName), ct);
        return result.IsSuccess
            ? Results.Ok(new { userId = result.Value.UserId })
            : Results.Problem(result.Error.Description, statusCode: StatusCodes.Status409Conflict);
    }

    internal static async Task<IResult> LoginAsync(
        LoginRequest req, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new LoginUserCommand(req.Email, req.Password), ct);
        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.Problem(result.Error.Description, statusCode: StatusCodes.Status401Unauthorized);
    }

    internal static async Task<IResult> GetMeAsync(
        ClaimsPrincipal user, IIdentityRepository repo, CancellationToken ct)
    {
        var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var found = await repo.GetByIdAsync(userId, ct);
        return found is null
            ? Results.NotFound()
            : Results.Ok(new { found.Id, found.Email, found.FirstName, found.LastName, Role = found.Role.ToString() });
    }

    internal static async Task<IResult> GetAddressesAsync(
        ClaimsPrincipal user, IIdentityRepository repo, CancellationToken ct)
    {
        var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var addresses = await repo.GetAddressesByUserIdAsync(userId, ct);
        return Results.Ok(addresses);
    }

    internal static async Task<IResult> AddAddressAsync(
        ClaimsPrincipal user, AddAddressRequest req,
        IIdentityRepository repo, CancellationToken ct)
    {
        var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var address = Address.Create(userId, req.Label, req.StreetLine1, req.City,
            req.Governorate, req.PostalCode, req.IsDefault, req.StreetLine2);
        await repo.AddAddressAsync(address, ct);
        await repo.SaveChangesAsync(ct);
        return Results.Created($"/api/v1/identity/me/addresses/{address.Id}", address);
    }

    internal static async Task<IResult> GetAllUsersAsync(IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAllUsersQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }
}

internal sealed record RegisterRequest(string Email, string Password, string FirstName, string LastName);
internal sealed record LoginRequest(string Email, string Password);
internal sealed record AddAddressRequest(
    string Label, string StreetLine1, string? StreetLine2,
    string City, string Governorate, string PostalCode, bool IsDefault = false);
