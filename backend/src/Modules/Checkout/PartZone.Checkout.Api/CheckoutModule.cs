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
        group.MapPost("/my-orders/{id:guid}/cancel", CheckoutEndpoints.CancelOrderAsync);
        group.MapPost("/my-orders/{id:guid}/reorder", CheckoutEndpoints.ReorderOrderAsync);

        var admin = app.MapGroup("/api/v1/admin/orders").RequireAuthorization("Admin");
        admin.MapGet("", AdminOrdersEndpoints.GetAllOrdersAsync);
        admin.MapGet("/{id:guid}", AdminOrdersEndpoints.GetOrderByIdAsync);
        admin.MapPut("/{id:guid}/status", AdminOrdersEndpoints.UpdateOrderStatusAsync);

        return app;
    }
}
