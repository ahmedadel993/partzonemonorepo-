using System.Reflection;
using HotChocolate.Execution.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
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

        graphql
            .AddDocumentFromString(sdl)
            .AddTypeExtension<MarketingQueryResolvers>()
            .AddTypeExtension<MarketingMutationResolvers>();

        return graphql;
    }

    public static IEndpointRouteBuilder MapMarketingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/marketing");

        group.MapGet("/page-blocks", MarketingEndpoints.GetActivePageBlocksAsync);
        group.MapGet("/coupons/{code}/validate", MarketingEndpoints.ValidateCouponAsync);

        return app;
    }
}
