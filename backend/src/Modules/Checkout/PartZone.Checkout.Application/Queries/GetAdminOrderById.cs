using PartZone.Checkout.Application.DTOs;
using PartZone.Checkout.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Checkout.Application.Queries;

public sealed record GetAdminOrderByIdQuery(Guid OrderId) : IQuery<AdminOrderDetailDto>;

internal sealed class GetAdminOrderByIdHandler(IOrderRepository repo)
    : IQueryHandler<GetAdminOrderByIdQuery, AdminOrderDetailDto>
{
    public async Task<Result<AdminOrderDetailDto>> Handle(GetAdminOrderByIdQuery request, CancellationToken ct)
    {
        var order = await repo.GetByIdAsync(request.OrderId, ct);
        if (order is null)
            return Result.Failure<AdminOrderDetailDto>(Error.NotFound("Order.NotFound", "Order not found."));
        return Result.Success(OrderMapper.ToAdminDetail(order));
    }
}
