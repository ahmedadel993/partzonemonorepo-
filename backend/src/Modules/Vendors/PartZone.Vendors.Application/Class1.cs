using Microsoft.Extensions.DependencyInjection;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;
using PartZone.Vendors.Domain;

namespace PartZone.Vendors.Application;

// ── Repository interface ──────────────────────────────────────────────────────

public interface IVendorRepository
{
    Task<Vendor?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<Vendor?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Vendor>> GetAllAsync(CancellationToken ct = default);
    void Add(Vendor vendor);
    void Update(Vendor vendor);
    Task SaveChangesAsync(CancellationToken ct = default);
}

// ── DTO ───────────────────────────────────────────────────────────────────────

public sealed record VendorDto(
    Guid Id,
    Guid UserId,
    string CompanyName,
    string? TaxId,
    string? PhoneNumber,
    decimal CommissionRate,
    string Status,
    DateTime CreatedAt);

// ── Commands ──────────────────────────────────────────────────────────────────

public sealed record RegisterVendorCommand(
    Guid UserId,
    string CompanyName,
    string? TaxId,
    string? PhoneNumber) : ICommand<Guid>;

internal sealed class RegisterVendorHandler(IVendorRepository repo)
    : ICommandHandler<RegisterVendorCommand, Guid>
{
    public async Task<Result<Guid>> Handle(RegisterVendorCommand request, CancellationToken ct)
    {
        var existing = await repo.GetByUserIdAsync(request.UserId, ct);
        if (existing is not null)
            return Result.Failure<Guid>(Error.Conflict("Vendors.AlreadyRegistered", "User is already registered as a vendor."));

        var vendor = Vendor.Create(request.UserId, request.CompanyName, request.TaxId, request.PhoneNumber);
        repo.Add(vendor);
        await repo.SaveChangesAsync(ct);
        return Result.Success(vendor.Id);
    }
}

public sealed record ApproveVendorCommand(Guid VendorId) : ICommand;

internal sealed class ApproveVendorHandler(IVendorRepository repo)
    : ICommandHandler<ApproveVendorCommand>
{
    public async Task<Result> Handle(ApproveVendorCommand request, CancellationToken ct)
    {
        var vendor = await repo.GetByIdAsync(request.VendorId, ct);
        if (vendor is null)
            return Result.Failure(Error.NotFound("Vendors.NotFound", "Vendor not found."));
        vendor.Approve();
        repo.Update(vendor);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public sealed record SuspendVendorCommand(Guid VendorId) : ICommand;

internal sealed class SuspendVendorHandler(IVendorRepository repo)
    : ICommandHandler<SuspendVendorCommand>
{
    public async Task<Result> Handle(SuspendVendorCommand request, CancellationToken ct)
    {
        var vendor = await repo.GetByIdAsync(request.VendorId, ct);
        if (vendor is null)
            return Result.Failure(Error.NotFound("Vendors.NotFound", "Vendor not found."));
        vendor.Suspend();
        repo.Update(vendor);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}

// ── Queries ───────────────────────────────────────────────────────────────────

public sealed record GetAllVendorsQuery : IQuery<IReadOnlyList<VendorDto>>;

internal sealed class GetAllVendorsHandler(IVendorRepository repo)
    : IQueryHandler<GetAllVendorsQuery, IReadOnlyList<VendorDto>>
{
    public async Task<Result<IReadOnlyList<VendorDto>>> Handle(GetAllVendorsQuery _, CancellationToken ct)
    {
        var vendors = await repo.GetAllAsync(ct);
        var dtos = vendors.Select(VendorMapper.Map).ToList().AsReadOnly();
        return Result.Success<IReadOnlyList<VendorDto>>(dtos);
    }
}

public sealed record GetMyVendorProfileQuery(Guid UserId) : IQuery<VendorDto?>;

internal sealed class GetMyVendorProfileHandler(IVendorRepository repo)
    : IQueryHandler<GetMyVendorProfileQuery, VendorDto?>
{
    public async Task<Result<VendorDto?>> Handle(GetMyVendorProfileQuery request, CancellationToken ct)
    {
        var vendor = await repo.GetByUserIdAsync(request.UserId, ct);
        return Result.Success(vendor is null ? null : VendorMapper.Map(vendor));
    }
}

internal static class VendorMapper
{
    internal static VendorDto Map(Vendor v) =>
        new(v.Id, v.UserId, v.CompanyName, v.TaxId, v.PhoneNumber, v.CommissionRate, v.Status.ToString(), v.CreatedAt);
}

// ── DI ────────────────────────────────────────────────────────────────────────

public static class VendorsApplicationExtensions
{
    public static IServiceCollection AddVendorsApplication(this IServiceCollection services) => services;
}
