namespace PartZone.Shared.Kernel.Domain;

public abstract class Entity<TId> : IEquatable<Entity<TId>>
{
    protected Entity(TId id) => Id = id;

    public TId Id { get; protected set; }

    public bool Equals(Entity<TId>? other) =>
        other is not null && EqualityComparer<TId>.Default.Equals(Id, other.Id);

    public override bool Equals(object? obj) => obj is Entity<TId> entity && Equals(entity);
    public override int GetHashCode() => EqualityComparer<TId>.Default.GetHashCode(Id!);
    public static bool operator ==(Entity<TId>? left, Entity<TId>? right) => left?.Equals(right) ?? right is null;
    public static bool operator !=(Entity<TId>? left, Entity<TId>? right) => !(left == right);
}
