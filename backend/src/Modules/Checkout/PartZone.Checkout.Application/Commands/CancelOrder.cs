using PartZone.Checkout.Application.Interfaces;
using PartZone.Checkout.Domain.Enums;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Checkout.Application.Commands;

public sealed record CancelOrderCommand(Guid OrderId, Guid UserId) : ICommand;

internal sealed class CancelOrderHandler(IOrderRepository repo) : ICommandHandler<CancelOrderCommand>
{
    public async Task<Result> Handle(CancelOrderCommand req, CancellationToken ct)
    {
        var order = await repo.GetByIdAsync(req.OrderId, ct);
        if (order is null)
            return Result.Failure(Error.NotFound("Checkout.OrderNotFound", "Order not found."));

        if (order.UserId != req.UserId)
            return Result.Failure(Error.Unauthorized("Checkout.Forbidden", "Not your order."));

        if (order.Status is not (OrderStatus.Pending or OrderStatus.Confirmed))
            return Result.Failure(new Error("Checkout.CannotCancel",
                "Only pending or confirmed orders can be cancelled."));

        order.Cancel();
        repo.Update(order);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
