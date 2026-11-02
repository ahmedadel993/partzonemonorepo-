using PartZone.Shared.Kernel.Domain;

namespace PartZone.Cart.Domain.Entities;

public sealed class Cart : AggregateRoot<Guid>
{
    private Cart() : base(Guid.Empty) { }

    public Guid UserId { get; private set; }
    public string? CouponCode { get; private set; }

    private readonly List<CartItem> _items = [];
    public IReadOnlyCollection<CartItem> Items => _items.AsReadOnly();

    public decimal SubTotal => _items.Sum(i => i.SubTotal);
    public int ItemCount => _items.Sum(i => i.Quantity);

    public static Cart Create(Guid userId) => new() { Id = Guid.NewGuid(), UserId = userId };

    public void AddItem(Guid productId, string sku, string name, decimal unitPrice, int quantity, string? imageUrl = null)
    {
        var existing = _items.FirstOrDefault(i => i.ProductId == productId);
        if (existing is not null)
        {
            existing.UpdateQuantity(existing.Quantity + quantity);
            return;
        }
        _items.Add(CartItem.Create(Id, productId, sku, name, unitPrice, quantity, imageUrl));
    }

    public void UpdateItemQuantity(Guid itemId, int quantity)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item is null) return;
        if (quantity <= 0)
            _items.Remove(item);
        else
            item.UpdateQuantity(quantity);
    }

    public void RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item is not null) _items.Remove(item);
    }

    public void Clear()
    {
        _items.Clear();
        CouponCode = null;
    }

    public void ApplyCoupon(string code) => CouponCode = code.ToUpperInvariant();
    public void RemoveCoupon() => CouponCode = null;
}
