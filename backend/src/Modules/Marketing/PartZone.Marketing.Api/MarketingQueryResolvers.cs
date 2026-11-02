using MediatR;
using PartZone.Marketing.Application.DTOs;
using PartZone.Marketing.Application.Queries;

namespace PartZone.Marketing.Api;

[ExtendObjectType("Query")]
public sealed class MarketingQueryResolvers
{
    public async Task<IReadOnlyList<PageBlockDto>> GetPageBlocksAsync(
        bool? onlyActive,
        [Service] IMediator mediator, CancellationToken ct)
    {
        if (onlyActive == true)
        {
            var activeResult = await mediator.Send(new GetActivePageBlocksQuery(), ct);
            if (!activeResult.IsSuccess) return [];
            return activeResult.Value!
                .Select(b => new PageBlockDto(b.Id, b.Type, b.SortOrder, true, null, null,
                    b.Config, b.BindingType, b.TargetId, b.TargetUrl, b.Translations))
                .ToList();
        }
        var result = await mediator.Send(new GetAllPageBlocksQuery(), ct);
        return result.IsSuccess ? result.Value! : [];
    }

    public async Task<PageBlockDto?> GetPageBlockAsync(
        Guid id,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetPageBlockByIdQuery(id), ct);
        return result.IsSuccess ? result.Value : null;
    }

    public async Task<IReadOnlyList<CouponDto>> GetCouponsAsync(
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAllCouponsQuery(), ct);
        return result.IsSuccess ? result.Value! : [];
    }

    public async Task<CouponValidationResult> ValidateCouponAsync(
        string code, float orderAmount,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new ValidateCouponQuery(code, Guid.Empty, (decimal)orderAmount), ct);
        return result.IsSuccess
            ? result.Value!
            : new CouponValidationResult(false, null, null, "ERROR");
    }
}
