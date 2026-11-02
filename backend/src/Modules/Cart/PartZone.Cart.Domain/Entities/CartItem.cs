using PartZone.Shared.Kernel.Domain;

namespace PartZone.Cart.Domain.Entities;

public sealed class CartItem : Entity<Guid>
{
    private CartItem() : base(Guid.Empty) { }

    public Guid CartId { get; private set; }
    public Guid ProductId { get; private set; }
    public string SKU { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public string? ImageUrl { get; private set; }
    public decimal SubTotal => UnitPrice * Quantity;

    internal static CartItem Create(
        Guid cartId, Guid productId, string sku, string name,
        decimal unitPrice, int quantity, string? imageUrl)
        => new()
        {
            Id = Guid.NewGuid(),
            CartId = cartId,
            ProductId = productId,
            SKU = sku,
            Name = name,
            UnitPrice = unitPrice,
            Quantity = quantity,
            ImageUrl = imageUrl,
        };

    internal void UpdateQuantity(int quantity) => Quantity = quantity;
}
