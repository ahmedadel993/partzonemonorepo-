using PartZone.Checkout.Application.DTOs;
using PartZone.Checkout.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Checkout.Application.Queries;

public sealed record GetOrderByIdQuery(Guid OrderId, Guid UserId) : IQuery<OrderDetailDto>;

internal sealed class GetOrderByIdHandler(IOrderRepository repo)
    : IQueryHandler<GetOrderByIdQuery, OrderDetailDto>
{
    public async Task<Result<OrderDetailDto>> Handle(GetOrderByIdQuery request, CancellationToken ct)
    {
        var order = await repo.GetByIdAsync(request.OrderId, ct);
        if (order is null || order.UserId != request.UserId)
            return Result.Failure<OrderDetailDto>(Error.NotFound("Order.NotFound", "Order not found."));
        return Result.Success(OrderMapper.ToDetail(order));
    }
}
