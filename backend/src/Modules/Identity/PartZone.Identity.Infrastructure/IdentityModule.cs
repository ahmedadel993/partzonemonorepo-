using Microsoft.Extensions.DependencyInjection;
using PartZone.Identity.Application;
using PartZone.Identity.Application.Commands;
using PartZone.Identity.Application.Interfaces;
using PartZone.Identity.Infrastructure.Services;

namespace PartZone.Identity.Infrastructure;

public static class IdentityModule
{
    public static IServiceCollection AddIdentityModule(
        this IServiceCollection services,
        JwtSettings jwtSettings)
    {
        services.AddSingleton(jwtSettings);
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<IIdentityRepository, IdentityRepository>();

        // MediatR handlers are registered from the Application assembly.
        // The Host calls AddMediatR with all module Application assemblies.
        // This method just registers the infrastructure services.

        return services;
    }
}
