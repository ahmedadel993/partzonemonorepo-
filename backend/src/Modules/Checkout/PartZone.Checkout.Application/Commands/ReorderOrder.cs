using PartZone.Checkout.Application.Interfaces;
using PartZone.Checkout.Domain.Entities;
using PartZone.Checkout.Domain.ValueObjects;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Checkout.Application.Commands;

public sealed record ReorderOrderCommand(Guid OrderId, Guid UserId) : ICommand<Guid>;

internal sealed class ReorderOrderHandler(IOrderRepository repo) : ICommandHandler<ReorderOrderCommand, Guid>
{
    public async Task<Result<Guid>> Handle(ReorderOrderCommand req, CancellationToken ct)
    {
        var original = await repo.GetByIdAsync(req.OrderId, ct);
        if (original is null)
            return Result.Failure<Guid>(Error.NotFound("Checkout.OrderNotFound", "Order not found."));

        if (original.UserId != req.UserId)
            return Result.Failure<Guid>(Error.Unauthorized("Checkout.Forbidden", "Not your order."));

        var items = original.Items.Select(i =>
            (i.ProductId, i.SKU, i.Name, i.UnitPrice, i.Quantity, i.ImageUrl));

        // Create a fresh ShippingAddress instance — the original is an EF-tracked owned entity
        // whose OrderId (a key property) cannot be reassigned to a new Order.
        var addr = original.ShippingAddress;
        var freshAddress = ShippingAddress.Create(
            addr.FullName, addr.Phone, addr.AddressLine1, addr.AddressLine2,
            addr.City, addr.Governorate, addr.PostalCode);

        var newOrder = Order.Create(
            req.UserId, items, freshAddress,
            null, 0m, null, original.PaymentMethod);

        repo.Add(newOrder);
        await repo.SaveChangesAsync(ct);
        return Result.Success(newOrder.Id);
    }
}
