using Microsoft.Extensions.DependencyInjection;
using PartZone.Marketing.Application.Interfaces;

namespace PartZone.Marketing.Infrastructure;

public static class MarketingInfrastructureExtensions
{
    public static IServiceCollection AddMarketingInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IPageBlockRepository, PageBlockRepository>();
        services.AddScoped<ICouponRepository, CouponRepository>();
        return services;
    }
}
