using MediatR;
using Microsoft.AspNetCore.Http;
using PartZone.Marketing.Application.Queries;

namespace PartZone.Marketing.Api;

internal static class MarketingEndpoints
{
    internal static async Task<IResult> GetActivePageBlocksAsync(IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetActivePageBlocksQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> ValidateCouponAsync(
        string code, [AsParameters] ValidateCouponParams p,
        IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new ValidateCouponQuery(code, Guid.Empty, (decimal)(p.OrderAmount ?? 0)), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }
}

internal sealed record ValidateCouponParams(double? OrderAmount);
