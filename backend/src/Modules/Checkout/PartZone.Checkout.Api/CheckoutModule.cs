using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Checkout.Infrastructure;

namespace PartZone.Checkout.Api;

public static class CheckoutModule
{
    public static IServiceCollection AddCheckoutModule(this IServiceCollection services)
    {
        services.AddCheckoutInfrastructure();
        return services;
    }

    public static IEndpointRouteBuilder MapCheckoutEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/checkout").RequireAuthorization();

        group.MapPost("/place-order", CheckoutEndpoints.PlaceOrderAsync);
        group.MapGet("/my-orders", CheckoutEndpoints.GetMyOrdersAsync);
        group.MapGet("/my-orders/{id}", CheckoutEndpoints.GetOrderByIdAsync);

        return app;
    }
}
