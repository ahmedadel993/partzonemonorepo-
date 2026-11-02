using Microsoft.Extensions.DependencyInjection;
using PartZone.Checkout.Application.Interfaces;

namespace PartZone.Checkout.Infrastructure;

public static class CheckoutInfrastructureExtensions
{
    public static IServiceCollection AddCheckoutInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IOrderRepository, OrderRepository>();
        return services;
    }
}
