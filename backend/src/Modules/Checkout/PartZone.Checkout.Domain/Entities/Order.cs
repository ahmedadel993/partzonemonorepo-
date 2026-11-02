using PartZone.Checkout.Domain.Enums;
using PartZone.Checkout.Domain.Events;
using PartZone.Checkout.Domain.ValueObjects;
using PartZone.Shared.Kernel.Domain;

namespace PartZone.Checkout.Domain.Entities;

public sealed class Order : AggregateRoot<Guid>
{
    private Order() : base(Guid.Empty) { }

    public string OrderNumber { get; private set; } = string.Empty;
    public Guid UserId { get; private set; }
    public OrderStatus Status { get; private set; }
    public ShippingAddress ShippingAddress { get; private set; } = null!;
    public string? CouponCode { get; private set; }
    public string? Notes { get; private set; }
    public decimal SubTotal { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal ShippingFee { get; private set; }
    public decimal Total { get; private set; }
    public DateTime PlacedAt { get; private set; }

    private readonly List<OrderItem> _items = [];
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    public static Order Create(
        Guid userId,
        IEnumerable<(Guid ProductId, string SKU, string Name, decimal UnitPrice, int Quantity, string? ImageUrl)> items,
        ShippingAddress shippingAddress,
        string? couponCode,
        decimal discountAmount,
        string? notes)
    {
        var guidPart = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = $"PZ-{DateTime.UtcNow:yyyyMMdd}-{guidPart}",
            UserId = userId,
            Status = OrderStatus.Pending,
            ShippingAddress = shippingAddress,
            CouponCode = couponCode,
            DiscountAmount = discountAmount,
            Notes = notes,
            PlacedAt = DateTime.UtcNow,
        };

        foreach (var item in items)
            order._items.Add(OrderItem.Create(order.Id, item.ProductId, item.SKU, item.Name, item.UnitPrice, item.Quantity, item.ImageUrl));

        order.SubTotal = order._items.Sum(i => i.SubTotal);
        order.ShippingFee = order.SubTotal - discountAmount >= 500m ? 0m : 15m;
        order.Total = order.SubTotal - discountAmount + order.ShippingFee;

        return order;
    }

    public void Cancel(string? reason = null)
    {
        Status = OrderStatus.Cancelled;
        RaiseDomainEvent(new OrderCancelledEvent(Id, reason));
    }
}
