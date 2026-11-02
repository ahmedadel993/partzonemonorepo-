using PartZone.Shared.Kernel.Domain;

namespace PartZone.Checkout.Domain.Events;

public sealed record OrderPlacedItem(Guid ProductId, int Quantity);

public sealed record OrderPlacedEvent(Guid OrderId, IReadOnlyList<OrderPlacedItem> Items) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
