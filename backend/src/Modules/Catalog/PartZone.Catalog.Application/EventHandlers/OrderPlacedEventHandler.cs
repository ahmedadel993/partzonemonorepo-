using MediatR;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Checkout.Domain.Events;

namespace PartZone.Catalog.Application.EventHandlers;

internal sealed class OrderPlacedEventHandler(
    ICatalogReadRepository read,
    ICatalogWriteRepository write)
    : INotificationHandler<OrderPlacedEvent>
{
    public async Task Handle(OrderPlacedEvent notification, CancellationToken ct)
    {
        foreach (var item in notification.Items)
        {
            var product = await read.GetProductByIdAsync(item.ProductId, ct);
            if (product is null) continue;

            product.DecrementStock(item.Quantity);
            write.UpdateProduct(product);
        }

        await write.SaveChangesAsync(ct);
    }
}
