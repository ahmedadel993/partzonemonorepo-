using PartZone.Marketing.Application.DTOs;
using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Queries;

public sealed record GetAllCouponsQuery : IQuery<IReadOnlyList<CouponDto>>;

internal sealed class GetAllCouponsHandler(ICouponRepository repo)
    : IQueryHandler<GetAllCouponsQuery, IReadOnlyList<CouponDto>>
{
    public async Task<Result<IReadOnlyList<CouponDto>>> Handle(
        GetAllCouponsQuery request, CancellationToken ct)
    {
        var coupons = await repo.GetAllAsync(ct);
        var dtos = coupons
            .Select(c => new CouponDto(
                c.Id, c.Code, c.DiscountType.ToString(), c.Value, c.MinOrderAmount,
                c.UsageLimit, c.PerUserLimit, c.UsedCount,
                c.ValidFrom.ToString("O"), c.ValidTo.ToString("O"), c.IsActive))
            .ToList();
        return Result.Success<IReadOnlyList<CouponDto>>(dtos);
    }
}
