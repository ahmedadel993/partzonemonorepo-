using HotChocolate;
using HotChocolate.Types;
using MediatR;
using PartZone.Identity.Application.Queries;
using PartZone.Vendors.Application;

namespace PartZone.Identity.Api;

[ExtendObjectType("Query")]
public sealed class IdentityQueryResolvers
{
    public async Task<IReadOnlyList<UserAdminDto>> GetUsersAsync(
        string? role, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAllUsersQuery(), ct);
        var users = result.IsSuccess ? result.Value! : (IReadOnlyList<UserAdminDto>)[];
        if (role is not null)
            users = users.Where(u => u.Role.Equals(role, StringComparison.OrdinalIgnoreCase)).ToList();
        return users;
    }

    public async Task<UserAdminDto?> GetUserByIdAsync(
        Guid id, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAllUsersQuery(), ct);
        return result.IsSuccess ? result.Value!.FirstOrDefault(u => u.Id == id) : null;
    }

    public async Task<IReadOnlyList<VendorDto>> GetGqlVendorsAsync(
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAllVendorsQuery(), ct);
        return result.IsSuccess ? result.Value! : (IReadOnlyList<VendorDto>)[];
    }

    public async Task<VendorDto?> GetGqlVendorByIdAsync(
        Guid id, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAllVendorsQuery(), ct);
        return result.IsSuccess ? result.Value!.FirstOrDefault(v => v.Id == id) : null;
    }
}
