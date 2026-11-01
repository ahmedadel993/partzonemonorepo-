using HotChocolate.Execution.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Catalog.Application.Interfaces;

namespace PartZone.Catalog.Infrastructure;

public static class CatalogModule
{
    public static IRequestExecutorBuilder AddCatalogModule(
        this IServiceCollection services,
        IRequestExecutorBuilder graphql)
    {
        services.AddScoped<ICatalogWriteRepository, CatalogWriteRepository>();
        services.AddScoped<ICatalogReadRepository, CatalogReadRepository>();
        return graphql;
    }
}
