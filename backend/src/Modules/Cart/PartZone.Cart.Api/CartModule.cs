using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Cart.Infrastructure;

namespace PartZone.Cart.Api;

public static class CartModule
{
    public static IServiceCollection AddCartModule(this IServiceCollection services)
    {
        services.AddCartInfrastructure();
        return services;
    }

    public static IEndpointRouteBuilder MapCartEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/cart").RequireAuthorization();

        group.MapGet("/", CartEndpoints.GetCartAsync);
        group.MapPost("/items", CartEndpoints.AddToCartAsync);
        group.MapPut("/items/{itemId}", CartEndpoints.UpdateItemAsync);
        group.MapDelete("/items/{itemId}", CartEndpoints.RemoveItemAsync);
        group.MapDelete("/", CartEndpoints.ClearCartAsync);

        return app;
    }
}
