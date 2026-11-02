using PartZone.Marketing.Application.Interfaces;
using PartZone.Marketing.Domain.Enums;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Commands;

public sealed record UpdateCouponCommand(
    Guid Id,
    string? DiscountType,
    decimal? Value,
    decimal? MinOrderAmount,
    int? UsageLimit,
    int? PerUserLimit,
    string? ValidFrom,
    string? ValidTo,
    bool? IsActive) : ICommand;

internal sealed class UpdateCouponHandler(ICouponRepository repo)
    : ICommandHandler<UpdateCouponCommand>
{
    public async Task<Result> Handle(UpdateCouponCommand request, CancellationToken ct)
    {
        var coupon = await repo.GetByIdAsync(request.Id, ct);
        if (coupon is null)
            return Result.Failure(Error.NotFound("Coupon.NotFound", $"Coupon {request.Id} not found."));

        var discountType = request.DiscountType is not null &&
            Enum.TryParse<DiscountType>(request.DiscountType, ignoreCase: true, out var dt)
            ? dt : coupon.DiscountType;

        var validFrom = request.ValidFrom is not null && DateTime.TryParse(request.ValidFrom, out var vf)
            ? vf.ToUniversalTime() : coupon.ValidFrom;
        var validTo = request.ValidTo is not null && DateTime.TryParse(request.ValidTo, out var vt)
            ? vt.ToUniversalTime() : coupon.ValidTo;

        coupon.Update(
            discountType,
            request.Value ?? coupon.Value,
            request.MinOrderAmount ?? coupon.MinOrderAmount,
            request.UsageLimit ?? coupon.UsageLimit,
            request.PerUserLimit ?? coupon.PerUserLimit,
            validFrom,
            validTo,
            request.IsActive ?? coupon.IsActive);

        repo.Update(coupon);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public sealed record DeactivateCouponCommand(Guid Id) : ICommand;

internal sealed class DeactivateCouponHandler(ICouponRepository repo)
    : ICommandHandler<DeactivateCouponCommand>
{
    public async Task<Result> Handle(DeactivateCouponCommand request, CancellationToken ct)
    {
        var coupon = await repo.GetByIdAsync(request.Id, ct);
        if (coupon is null)
            return Result.Failure(Error.NotFound("Coupon.NotFound", $"Coupon {request.Id} not found."));
        coupon.Deactivate();
        repo.Update(coupon);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
