using HotChocolate.Execution.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PartZone.Identity.Application.Queries;
using PartZone.Vendors.Application;

namespace PartZone.Identity.Api;

public static class IdentityGqlModule
{
    public static IRequestExecutorBuilder AddIdentityGqlModule(
        this IServiceCollection services,
        IRequestExecutorBuilder graphql)
    {
        var assembly = typeof(IdentityGqlModule).Assembly;
        using var stream = assembly.GetManifestResourceStream(
            "PartZone.Identity.Api.Schemas.identity.graphql")
            ?? throw new InvalidOperationException("identity.graphql embedded resource not found.");
        using var reader = new System.IO.StreamReader(stream);
        var sdl = reader.ReadToEnd();

        graphql
            .AddDocumentFromString(sdl)
            .AddType<IdentityQueryResolvers>()
            .AddResolver<IdentityMutationResolvers>("Mutation")
            // Output types
            .BindRuntimeType<UserAdminDto>("UserType")
            .BindRuntimeType<VendorDto>("VendorGqlType")
            // Payloads
            .BindRuntimeType<UserPayloadDto>("UserPayload")
            .BindRuntimeType<VendorGqlPayloadDto>("VendorGqlPayload")
            // Inputs
            .BindRuntimeType<AdminCreateUserGqlInput>("AdminCreateUserInput")
            .BindRuntimeType<UpdateUserGqlInput>("UpdateUserInput")
            .BindRuntimeType<AdminCreateVendorGqlInput>("AdminCreateVendorInput")
            .BindRuntimeType<UpdateVendorGqlInput>("UpdateVendorInput")
            .AddResolver("UserType", "createdAt",
                ctx => ctx.Parent<UserAdminDto>().CreatedAt.ToString("O"))
            .AddResolver("VendorGqlType", "createdAt",
                ctx => ctx.Parent<VendorDto>().CreatedAt.ToString("O"));

        return graphql;
    }
}
