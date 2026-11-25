using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace PartZone.Identity.Api;

public static class IdentityApiModule
{
    public static IEndpointRouteBuilder MapIdentityEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/identity");

        group.MapPost("/auth/register", IdentityEndpoints.RegisterAsync);
        group.MapPost("/auth/login", IdentityEndpoints.LoginAsync);
        group.MapGet("/me", IdentityEndpoints.GetMeAsync).RequireAuthorization();
        group.MapGet("/me/addresses", IdentityEndpoints.GetAddressesAsync).RequireAuthorization();
        group.MapPost("/me/addresses", IdentityEndpoints.AddAddressAsync).RequireAuthorization();
        group.MapPut("/me/addresses/{id:guid}", IdentityEndpoints.UpdateAddressAsync).RequireAuthorization();
        group.MapPatch("/me/addresses/{id:guid}/default", IdentityEndpoints.SetDefaultAddressAsync).RequireAuthorization();
        group.MapDelete("/me/addresses/{id:guid}", IdentityEndpoints.DeleteAddressAsync).RequireAuthorization();

        app.MapGet("/api/v1/admin/users", IdentityEndpoints.GetAllUsersAsync)
            .RequireAuthorization("Admin");
        app.MapPut("/api/v1/admin/users/{id:guid}/role", IdentityEndpoints.ChangeUserRoleAsync)
            .RequireAuthorization("Admin");

        group.MapPut("/me", IdentityEndpoints.UpdateMyProfileAsync).RequireAuthorization();
        group.MapPut("/me/password", IdentityEndpoints.ChangePasswordAsync).RequireAuthorization();

        return app;
    }
}
