using PartZone.Shared.Kernel.Domain;

namespace PartZone.Checkout.Domain.Events;

public sealed record OrderCancelledEvent(Guid OrderId, string? Reason) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
