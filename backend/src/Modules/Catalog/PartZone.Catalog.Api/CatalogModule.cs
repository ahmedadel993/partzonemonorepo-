using System.Reflection;
using HotChocolate.Execution.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Catalog.Infrastructure;

namespace PartZone.Catalog.Api;

public static class CatalogModule
{
    public static IRequestExecutorBuilder AddCatalogModule(
        this IServiceCollection services,
        IRequestExecutorBuilder graphql)
    {
        // Infrastructure: repositories
        services.AddCatalogInfrastructure();

        // Load catalog.graphql SDL from embedded resource
        var assembly = typeof(CatalogModule).Assembly;
        using var stream = assembly.GetManifestResourceStream(
            "PartZone.Catalog.Api.Schemas.catalog.graphql")
            ?? throw new InvalidOperationException("catalog.graphql embedded resource not found.");
        using var reader = new System.IO.StreamReader(stream);
        var sdl = reader.ReadToEnd();

        // GraphQL: register SDL and resolver extensions
        graphql
            .AddDocumentFromString(sdl)
            .AddTypeExtension<CatalogQueryResolvers>()
            .AddTypeExtension<CatalogMutationResolvers>();

        return graphql;
    }

    public static IEndpointRouteBuilder MapCatalogEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/catalog").WithTags("Catalog");

        group.MapGet("/brands", CatalogEndpoints.GetBrandsAsync);
        group.MapGet("/brands/{slug}", CatalogEndpoints.GetBrandAsync);
        group.MapPost("/brands", CatalogEndpoints.CreateBrandAsync).RequireAuthorization();
        group.MapPut("/brands/{id:guid}", CatalogEndpoints.UpdateBrandAsync).RequireAuthorization();

        group.MapGet("/categories", CatalogEndpoints.GetCategoriesAsync);
        group.MapGet("/categories/{slug}", CatalogEndpoints.GetCategoryAsync);
        group.MapPost("/categories", CatalogEndpoints.CreateCategoryAsync).RequireAuthorization();

        group.MapGet("/products", CatalogEndpoints.GetProductsAsync);
        group.MapGet("/products/{slug}", CatalogEndpoints.GetProductAsync);
        group.MapPost("/products", CatalogEndpoints.CreateProductAsync).RequireAuthorization();

        group.MapGet("/vehicle-makes", CatalogEndpoints.GetVehicleMakesAsync);
        group.MapGet("/vehicle-makes/{makeId:guid}/models", CatalogEndpoints.GetVehicleModelsAsync);
        group.MapGet("/vehicle-models/{modelId:guid}/years", CatalogEndpoints.GetVehicleYearsAsync);

        return app;
    }
}
