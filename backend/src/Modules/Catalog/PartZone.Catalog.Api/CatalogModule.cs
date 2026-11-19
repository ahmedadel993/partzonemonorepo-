using System.Reflection;
using HotChocolate.Execution.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Catalog.Application.Queries;
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
        // GraphQL (schema-first): the SDL is the contract. Resolver classes are
        // bound to the root types, and every SDL type is bound to the C# record
        // that backs it so HotChocolate can resolve its fields.
        graphql
            .AddDocumentFromString(sdl)
            .AddResolver<CatalogQueryResolvers>("Query")
            .AddResolver<CatalogMutationResolvers>("Mutation")
            // Output types
            .BindRuntimeType<BrandDto>("BrandType")
            .BindRuntimeType<CategoryDto>("CategoryType")
            .BindRuntimeType<VehicleMakeDto>("VehicleMakeType")
            .BindRuntimeType<VehicleModelDto>("VehicleModelType")
            .BindRuntimeType<VehicleYearRangeDto>("VehicleYearRangeType")
            .BindRuntimeType<ProductSummaryDto>("ProductSummaryType")
            .BindRuntimeType<ProductDetailDto>("ProductDetailType")
            .BindRuntimeType<ProductImageDto>("ProductImageType")
            .BindRuntimeType<ProductFitmentDto>("ProductFitmentType")
            .BindRuntimeType<PagedResult<ProductSummaryDto>>("ProductPageType")
            // Payloads
            .BindRuntimeType<BrandPayloadDto>("BrandPayload")
            .BindRuntimeType<CategoryPayloadDto>("CategoryPayload")
            .BindRuntimeType<VehicleMakePayloadDto>("VehicleMakePayload")
            .BindRuntimeType<VehicleModelPayloadDto>("VehicleModelPayload")
            .BindRuntimeType<DeletePayloadDto>("DeletePayload")
            .BindRuntimeType<ProductPayloadDto>("ProductPayload")
            // Inputs
            .BindRuntimeType<ProductFilterInput>("ProductFilterInput")
            .BindRuntimeType<CreateBrandGqlInput>("CreateBrandInput")
            .BindRuntimeType<UpdateBrandGqlInput>("UpdateBrandInput")
            .BindRuntimeType<CreateCategoryGqlInput>("CreateCategoryInput")
            .BindRuntimeType<UpdateCategoryGqlInput>("UpdateCategoryInput")
            .BindRuntimeType<CreateVehicleMakeGqlInput>("CreateVehicleMakeInput")
            .BindRuntimeType<UpdateVehicleMakeGqlInput>("UpdateVehicleMakeInput")
            .BindRuntimeType<CreateVehicleModelGqlInput>("CreateVehicleModelInput")
            .BindRuntimeType<UpdateVehicleModelGqlInput>("UpdateVehicleModelInput")
            .BindRuntimeType<CreateProductGqlInput>("CreateProductInput")
            .BindRuntimeType<UpdateProductGqlInput>("UpdateProductInput")
            .BindRuntimeType<ProductTranslationGqlInput>("ProductTranslationInputType")
            .BindRuntimeType<UpdateProductStockGqlInput>("UpdateProductStockInput")
            .BindRuntimeType<AddProductFitmentGqlInput>("AddProductFitmentInput")
            .BindRuntimeType<AddProductImageGqlInput>("AddProductImageInput")
            // SDL fields whose name differs from the DTO property
            .AddResolver("VehicleModelType", "vehicleMakeId",
                ctx => ctx.Parent<VehicleModelDto>().MakeId)
            .AddResolver("VehicleYearRangeType", "vehicleModelId",
                ctx => ctx.Parent<VehicleYearRangeDto>().ModelId)
            .AddResolver("ProductPageType", "totalPages", ctx =>
            {
                var page = ctx.Parent<PagedResult<ProductSummaryDto>>();
                return page.PageSize > 0
                    ? (int)Math.Ceiling(page.TotalCount / (double)page.PageSize)
                    : 0;
            });

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
