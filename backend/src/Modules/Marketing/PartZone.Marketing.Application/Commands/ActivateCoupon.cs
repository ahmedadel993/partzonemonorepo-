using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Commands;

public sealed record ActivateCouponCommand(Guid Id) : ICommand;

internal sealed class ActivateCouponHandler(ICouponRepository repo)
    : ICommandHandler<ActivateCouponCommand>
{
    public async Task<Result> Handle(ActivateCouponCommand request, CancellationToken ct)
    {
        var coupon = await repo.GetByIdAsync(request.Id, ct);
        if (coupon is null) return Result.Failure(Error.NotFound("Coupon.NotFound", $"Coupon {request.Id} not found."));
        coupon.Activate();
        repo.Update(coupon);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public sealed record DeleteCouponCommand(Guid Id) : ICommand;

internal sealed class DeleteCouponHandler(ICouponRepository repo)
    : ICommandHandler<DeleteCouponCommand>
{
    public async Task<Result> Handle(DeleteCouponCommand request, CancellationToken ct)
    {
        var coupon = await repo.GetByIdAsync(request.Id, ct);
        if (coupon is null) return Result.Failure(Error.NotFound("Coupon.NotFound", $"Coupon {request.Id} not found."));
        repo.Remove(coupon);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
