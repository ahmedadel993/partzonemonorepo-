using Microsoft.Extensions.DependencyInjection;
using PartZone.Catalog.Application.Interfaces;

namespace PartZone.Catalog.Infrastructure;

public static class CatalogInfrastructureExtensions
{
    public static IServiceCollection AddCatalogInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<ICatalogWriteRepository, CatalogWriteRepository>();
        services.AddScoped<ICatalogReadRepository, CatalogReadRepository>();
        return services;
    }
}
