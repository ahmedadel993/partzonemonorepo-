using System.Reflection;
using HotChocolate.Execution.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Marketing.Application.DTOs;
using PartZone.Marketing.Infrastructure;

namespace PartZone.Marketing.Api;

public static class MarketingModule
{
    public static IRequestExecutorBuilder AddMarketingModule(
        this IServiceCollection services,
        IRequestExecutorBuilder graphql)
    {
        services.AddMarketingInfrastructure();

        var assembly = typeof(MarketingModule).Assembly;
        using var stream = assembly.GetManifestResourceStream(
            "PartZone.Marketing.Api.Schemas.marketing.graphql")
            ?? throw new InvalidOperationException("marketing.graphql embedded resource not found.");
        using var reader = new System.IO.StreamReader(stream);
        var sdl = reader.ReadToEnd();

        // GraphQL (schema-first): bind resolver classes to the root types and
        // every SDL type to its backing C# record.
        graphql
            .AddDocumentFromString(sdl)
            .AddResolver<MarketingQueryResolvers>("Query")
            .AddResolver<MarketingMutationResolvers>("Mutation")
            .BindRuntimeType<PageBlockDto>("PageBlockType")
            .BindRuntimeType<PageBlockTranslationDto>("PageBlockTranslationType")
            .BindRuntimeType<CouponDto>("CouponType")
            .BindRuntimeType<CouponValidationResult>("CouponValidationResultType")
            .BindRuntimeType<PageBlockPayloadDto>("PageBlockPayload")
            .BindRuntimeType<CouponPayloadDto>("CouponPayload")
            .BindRuntimeType<CreatePageBlockInputGql>("CreatePageBlockInput")
            .BindRuntimeType<UpdatePageBlockInputGql>("UpdatePageBlockInput")
            .BindRuntimeType<PageBlockTranslationInputGql>("PageBlockTranslationInput")
            .BindRuntimeType<ReorderItemInputGql>("ReorderItemInput")
            .BindRuntimeType<CreateCouponInputGql>("CreateCouponInput")
            .BindRuntimeType<UpdateCouponInputGql>("UpdateCouponInput")
            // Phase 6 – payment methods
            .BindRuntimeType<PaymentMethodDto>("PaymentMethodType")
            .BindRuntimeType<PaymentMethodPayloadDto>("PaymentMethodPayload")
            .BindRuntimeType<CreatePaymentMethodInputGql>("CreatePaymentMethodInput")
            .BindRuntimeType<UpdatePaymentMethodInputGql>("UpdatePaymentMethodInput");

        return graphql;
    }

    public static IEndpointRouteBuilder MapMarketingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/marketing");

        group.MapGet("/page-blocks", MarketingEndpoints.GetActivePageBlocksAsync);
        group.MapGet("/coupons/{code}/validate", MarketingEndpoints.ValidateCouponAsync);
        // Phase 6 – payment methods REST endpoint for storefront
        group.MapGet("/payment-methods", MarketingEndpoints.GetActivePaymentMethodsAsync);

        return app;
    }
}
