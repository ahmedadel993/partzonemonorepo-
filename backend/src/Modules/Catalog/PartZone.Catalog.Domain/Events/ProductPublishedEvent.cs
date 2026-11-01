using PartZone.Shared.Kernel.Domain;

namespace PartZone.Catalog.Domain.Events;

public sealed record ProductPublishedEvent(Guid ProductId) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
