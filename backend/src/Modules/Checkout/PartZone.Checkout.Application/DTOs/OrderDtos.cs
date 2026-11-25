using PartZone.Checkout.Domain.Entities;
using PartZone.Checkout.Domain.Enums;

namespace PartZone.Checkout.Application.DTOs;

public sealed record OrderConfirmationDto(
    Guid OrderId, string OrderNumber, decimal Total, DateTime PlacedAt);

public sealed record OrderItemDto(
    Guid Id, Guid ProductId, string SKU, string Name,
    decimal UnitPrice, int Quantity, decimal SubTotal, string? ImageUrl);

public sealed record ShippingAddressDto(
    string FullName, string Phone, string AddressLine1, string? AddressLine2,
    string City, string Governorate, string PostalCode);

public sealed record OrderSummaryDto(
    Guid Id, string OrderNumber, string Status,
    decimal Total, int ItemCount, DateTime PlacedAt);

public sealed record OrderDetailDto(
    Guid Id, string OrderNumber, string Status,
    decimal SubTotal, decimal DiscountAmount, decimal ShippingFee, decimal Total,
    string? CouponCode, string? Notes, DateTime PlacedAt,
    ShippingAddressDto ShippingAddress,
    IReadOnlyList<OrderItemDto> Items);

public sealed record AdminOrderSummaryDto(
    Guid Id, string OrderNumber, Guid UserId, string Status,
    decimal Total, int ItemCount, DateTime PlacedAt, string PaymentMethod);

public sealed record AdminOrderDetailDto(
    Guid Id, string OrderNumber, Guid UserId, string Status,
    decimal SubTotal, decimal DiscountAmount, decimal ShippingFee, decimal Total,
    string? CouponCode, string? Notes, DateTime PlacedAt, string PaymentMethod,
    string ShippingFullName, string ShippingPhone,
    string ShippingAddressLine1, string? ShippingAddressLine2,
    string ShippingCity, string ShippingGovernorate, string ShippingPostalCode,
    IReadOnlyList<OrderItemDto> Items);

internal static class OrderMapper
{
    internal static OrderConfirmationDto ToConfirmation(Order o) =>
        new(o.Id, o.OrderNumber, o.Total, o.PlacedAt);

    internal static OrderSummaryDto ToSummary(Order o) =>
        new(o.Id, o.OrderNumber, o.Status.ToString(), o.Total, o.Items.Count, o.PlacedAt);

    internal static AdminOrderSummaryDto ToAdminSummary(Order o) =>
        new(o.Id, o.OrderNumber, o.UserId, o.Status.ToString(), o.Total, o.Items.Count, o.PlacedAt, o.PaymentMethod);

    internal static AdminOrderDetailDto ToAdminDetail(Order o) => new(
        o.Id, o.OrderNumber, o.UserId, o.Status.ToString(),
        o.SubTotal, o.DiscountAmount, o.ShippingFee, o.Total,
        o.CouponCode, o.Notes, o.PlacedAt, o.PaymentMethod,
        o.ShippingAddress.FullName, o.ShippingAddress.Phone,
        o.ShippingAddress.AddressLine1, o.ShippingAddress.AddressLine2,
        o.ShippingAddress.City, o.ShippingAddress.Governorate, o.ShippingAddress.PostalCode,
        o.Items.Select(i => new OrderItemDto(
            i.Id, i.ProductId, i.SKU, i.Name, i.UnitPrice, i.Quantity, i.SubTotal, i.ImageUrl))
            .ToList().AsReadOnly());

    internal static OrderDetailDto ToDetail(Order o) => new(
        o.Id, o.OrderNumber, o.Status.ToString(),
        o.SubTotal, o.DiscountAmount, o.ShippingFee, o.Total,
        o.CouponCode, o.Notes, o.PlacedAt,
        new ShippingAddressDto(
            o.ShippingAddress.FullName, o.ShippingAddress.Phone,
            o.ShippingAddress.AddressLine1, o.ShippingAddress.AddressLine2,
            o.ShippingAddress.City, o.ShippingAddress.Governorate, o.ShippingAddress.PostalCode),
        o.Items.Select(i => new OrderItemDto(
            i.Id, i.ProductId, i.SKU, i.Name, i.UnitPrice, i.Quantity, i.SubTotal, i.ImageUrl))
            .ToList().AsReadOnly());
}
