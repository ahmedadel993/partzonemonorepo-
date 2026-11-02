using PartZone.Shared.Kernel.Domain;

namespace PartZone.Checkout.Domain.Entities;

public sealed class OrderItem : Entity<Guid>
{
    private OrderItem() : base(Guid.Empty) { }

    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public string SKU { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public decimal SubTotal { get; private set; }
    public string? ImageUrl { get; private set; }

    internal static OrderItem Create(
        Guid orderId, Guid productId, string sku, string name,
        decimal unitPrice, int quantity, string? imageUrl = null)
        => new()
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            ProductId = productId,
            SKU = sku,
            Name = name,
            UnitPrice = unitPrice,
            Quantity = quantity,
            SubTotal = unitPrice * quantity,
            ImageUrl = imageUrl,
        };
}
