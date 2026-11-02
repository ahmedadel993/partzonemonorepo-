using Microsoft.Extensions.DependencyInjection;
using PartZone.Cart.Application.Interfaces;

namespace PartZone.Cart.Infrastructure;

public static class CartInfrastructureExtensions
{
    public static IServiceCollection AddCartInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<ICartRepository, CartRepository>();
        return services;
    }
}
