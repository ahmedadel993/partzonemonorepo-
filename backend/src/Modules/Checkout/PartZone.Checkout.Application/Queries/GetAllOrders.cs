using PartZone.Checkout.Application.DTOs;
using PartZone.Checkout.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Checkout.Application.Queries;

public sealed record GetAllOrdersQuery : IQuery<IReadOnlyList<AdminOrderSummaryDto>>;

internal sealed class GetAllOrdersHandler(IOrderRepository repo)
    : IQueryHandler<GetAllOrdersQuery, IReadOnlyList<AdminOrderSummaryDto>>
{
    public async Task<Result<IReadOnlyList<AdminOrderSummaryDto>>> Handle(GetAllOrdersQuery request, CancellationToken ct)
    {
        var orders = await repo.GetAllAsync(ct);
        IReadOnlyList<AdminOrderSummaryDto> result = orders.Select(OrderMapper.ToAdminSummary).ToList().AsReadOnly();
        return Result.Success(result);
    }
}
