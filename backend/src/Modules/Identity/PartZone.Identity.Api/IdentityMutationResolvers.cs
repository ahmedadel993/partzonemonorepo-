using HotChocolate;
using HotChocolate.Types;
using MediatR;
using PartZone.Catalog.Api;
using PartZone.Identity.Application.Commands;
using PartZone.Identity.Application.Queries;
using PartZone.Vendors.Application;

namespace PartZone.Identity.Api;

// ── Input records ──────────────────────────────────────────────────────────────

public sealed record AdminCreateUserGqlInput(
    string Email, string Password, string FirstName, string LastName, string Role);

public sealed record UpdateUserGqlInput(Guid Id, string FirstName, string LastName, string? PhoneNumber, string? Role);

public sealed record AdminCreateVendorGqlInput(
    Guid UserId, string CompanyName, string? TaxId, string? PhoneNumber, decimal CommissionRate);

public sealed record UpdateVendorGqlInput(
    Guid Id, string CompanyName, string? TaxId, string? PhoneNumber, decimal CommissionRate);

// ── Payload records ────────────────────────────────────────────────────────────

public sealed record UserPayloadDto(UserAdminDto? User, IReadOnlyList<string> Errors);

public sealed record VendorGqlPayloadDto(VendorDto? Vendor, IReadOnlyList<string> Errors);

// ── Resolvers ──────────────────────────────────────────────────────────────────

[ExtendObjectType("Mutation")]
public sealed class IdentityMutationResolvers
{
    public async Task<UserPayloadDto> AdminCreateUserAsync(
        AdminCreateUserGqlInput input, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new AdminCreateUserCommand(input.Email, input.Password, input.FirstName, input.LastName, input.Role), ct);
        if (!result.IsSuccess)
            return new UserPayloadDto(null, [result.Error.Description]);

        var users = await mediator.Send(new GetAllUsersQuery(), ct);
        var user = users.IsSuccess ? users.Value!.FirstOrDefault(u => u.Id == result.Value) : null;
        return new UserPayloadDto(user, []);
    }

    public async Task<UserPayloadDto> UpdateUserAsync(
        UpdateUserGqlInput input, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new UpdateUserCommand(input.Id, input.FirstName, input.LastName, input.PhoneNumber, input.Role), ct);
        if (!result.IsSuccess)
            return new UserPayloadDto(null, [result.Error.Description]);

        var users = await mediator.Send(new GetAllUsersQuery(), ct);
        var user = users.IsSuccess ? users.Value!.FirstOrDefault(u => u.Id == input.Id) : null;
        return new UserPayloadDto(user, []);
    }

    public async Task<DeletePayloadDto> DeleteUserAsync(
        Guid id, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteUserCommand(id), ct);
        return result.IsSuccess
            ? new DeletePayloadDto([])
            : new DeletePayloadDto([result.Error.Description]);
    }

    public async Task<VendorGqlPayloadDto> AdminCreateVendorAsync(
        AdminCreateVendorGqlInput input, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new AdminCreateVendorCommand(input.UserId, input.CompanyName, input.TaxId, input.PhoneNumber, input.CommissionRate), ct);
        if (!result.IsSuccess)
            return new VendorGqlPayloadDto(null, [result.Error.Description]);

        var vendors = await mediator.Send(new GetAllVendorsQuery(), ct);
        var vendor = vendors.IsSuccess ? vendors.Value!.FirstOrDefault(v => v.Id == result.Value) : null;
        return new VendorGqlPayloadDto(vendor, []);
    }

    public async Task<VendorGqlPayloadDto> UpdateVendorAsync(
        UpdateVendorGqlInput input, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new UpdateVendorCommand(input.Id, input.CompanyName, input.TaxId, input.PhoneNumber, input.CommissionRate), ct);
        if (!result.IsSuccess)
            return new VendorGqlPayloadDto(null, [result.Error.Description]);

        var vendors = await mediator.Send(new GetAllVendorsQuery(), ct);
        var vendor = vendors.IsSuccess ? vendors.Value!.FirstOrDefault(v => v.Id == input.Id) : null;
        return new VendorGqlPayloadDto(vendor, []);
    }

    public async Task<DeletePayloadDto> DeleteVendorAsync(
        Guid id, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteVendorCommand(id), ct);
        return result.IsSuccess
            ? new DeletePayloadDto([])
            : new DeletePayloadDto([result.Error.Description]);
    }

    public async Task<VendorGqlPayloadDto> ApproveVendorAsync(
        Guid id, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new ApproveVendorCommand(id), ct);
        if (!result.IsSuccess)
            return new VendorGqlPayloadDto(null, [result.Error.Description]);

        var vendors = await mediator.Send(new GetAllVendorsQuery(), ct);
        var vendor = vendors.IsSuccess ? vendors.Value!.FirstOrDefault(v => v.Id == id) : null;
        return new VendorGqlPayloadDto(vendor, []);
    }

    public async Task<VendorGqlPayloadDto> SuspendVendorAsync(
        Guid id, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new SuspendVendorCommand(id), ct);
        if (!result.IsSuccess)
            return new VendorGqlPayloadDto(null, [result.Error.Description]);

        var vendors = await mediator.Send(new GetAllVendorsQuery(), ct);
        var vendor = vendors.IsSuccess ? vendors.Value!.FirstOrDefault(v => v.Id == id) : null;
        return new VendorGqlPayloadDto(vendor, []);
    }
}
