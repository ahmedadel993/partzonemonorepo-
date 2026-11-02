using PartZone.Shared.Kernel.Domain;

namespace PartZone.Erp.Domain;

public sealed class StockAdjustment : Entity<Guid>
{
    public Guid ProductId { get; private set; }
    public int Delta { get; private set; }
    public string Reason { get; private set; } = default!;
    public Guid AdminUserId { get; private set; }
    public DateTime AdjustedAt { get; private set; }

    private StockAdjustment() : base(Guid.Empty) { }

    public static StockAdjustment Create(Guid productId, int delta, string reason, Guid adminUserId) =>
        new()
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Delta = delta,
            Reason = reason,
            AdminUserId = adminUserId,
            AdjustedAt = DateTime.UtcNow,
        };
}
