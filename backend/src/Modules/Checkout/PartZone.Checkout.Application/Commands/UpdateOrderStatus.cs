using PartZone.Checkout.Application.Interfaces;
using PartZone.Checkout.Domain.Enums;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Checkout.Application.Commands;

public sealed record UpdateOrderStatusCommand(Guid OrderId, string Status) : ICommand;

internal sealed class UpdateOrderStatusHandler(IOrderRepository repo)
    : ICommandHandler<UpdateOrderStatusCommand>
{
    public async Task<Result> Handle(UpdateOrderStatusCommand request, CancellationToken ct)
    {
        var order = await repo.GetByIdAsync(request.OrderId, ct);
        if (order is null)
            return Result.Failure(Error.NotFound("Order.NotFound", "Order not found."));

        if (!Enum.TryParse<OrderStatus>(request.Status, out var status))
            return Result.Failure(Error.Validation("Order.InvalidStatus", $"Invalid status: {request.Status}"));

        order.UpdateStatus(status);
        repo.Update(order);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
