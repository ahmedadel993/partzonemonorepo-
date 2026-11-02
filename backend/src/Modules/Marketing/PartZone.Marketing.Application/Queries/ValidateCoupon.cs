using PartZone.Marketing.Application.DTOs;
using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Queries;

public sealed record ValidateCouponQuery(string Code, Guid UserId, decimal OrderAmount)
    : IQuery<CouponValidationResult>;

internal sealed class ValidateCouponHandler(ICouponRepository repo)
    : IQueryHandler<ValidateCouponQuery, CouponValidationResult>
{
    public async Task<Result<CouponValidationResult>> Handle(
        ValidateCouponQuery request, CancellationToken ct)
    {
        var coupon = await repo.GetByCodeAsync(request.Code.ToUpperInvariant(), ct);
        if (coupon is null)
            return Result.Success(new CouponValidationResult(false, null, null, "NOT_FOUND"));

        if (!coupon.IsValidNow())
            return Result.Success(new CouponValidationResult(false, null, null, "EXPIRED_OR_INACTIVE"));

        if (coupon.MinOrderAmount.HasValue && request.OrderAmount < coupon.MinOrderAmount.Value)
            return Result.Success(new CouponValidationResult(false, null, null, "BELOW_MINIMUM"));

        if (request.UserId != Guid.Empty && coupon.PerUserLimit > 0)
        {
            var userCount = await repo.GetUserUsageCountAsync(coupon.Id, request.UserId, ct);
            if (userCount >= coupon.PerUserLimit)
                return Result.Success(new CouponValidationResult(false, null, null, "PER_USER_LIMIT"));
        }

        return Result.Success(new CouponValidationResult(
            true, coupon.DiscountType.ToString(), coupon.Value, null));
    }
}
