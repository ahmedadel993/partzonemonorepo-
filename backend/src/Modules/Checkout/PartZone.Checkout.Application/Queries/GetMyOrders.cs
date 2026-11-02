using PartZone.Checkout.Application.DTOs;
using PartZone.Checkout.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Checkout.Application.Queries;

public sealed record GetMyOrdersQuery(Guid UserId) : IQuery<IReadOnlyList<OrderSummaryDto>>;

internal sealed class GetMyOrdersHandler(IOrderRepository repo)
    : IQueryHandler<GetMyOrdersQuery, IReadOnlyList<OrderSummaryDto>>
{
    public async Task<Result<IReadOnlyList<OrderSummaryDto>>> Handle(GetMyOrdersQuery request, CancellationToken ct)
    {
        var orders = await repo.GetByUserIdAsync(request.UserId, ct);
        IReadOnlyList<OrderSummaryDto> result = orders.Select(OrderMapper.ToSummary).ToList().AsReadOnly();
        return Result.Success(result);
    }
}
