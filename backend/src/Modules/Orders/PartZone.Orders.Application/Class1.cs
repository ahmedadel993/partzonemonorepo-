using PartZone.Checkout.Domain.Entities;
using PartZone.Checkout.Domain.Enums;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Orders.Application;

// ── DTOs ─────────────────────────────────────────────────────────────────────

public sealed record OrderAdminItemDto(
    Guid Id,
    Guid ProductId,
    string SKU,
    string Name,
    decimal UnitPrice,
    int Quantity,
    decimal SubTotal,
    string? ImageUrl);

public sealed record OrderAdminSummaryDto(
    Guid Id,
    string OrderNumber,
    Guid UserId,
    string Status,
    decimal Total,
    int ItemCount,
    DateTime PlacedAt);

public sealed record OrderAdminDetailDto(
    Guid Id,
    string OrderNumber,
    Guid UserId,
    string Status,
    decimal SubTotal,
    decimal DiscountAmount,
    decimal ShippingFee,
    decimal Total,
    string? CouponCode,
    string? Notes,
    DateTime PlacedAt,
    string ShippingFullName,
    string ShippingPhone,
    string ShippingAddressLine1,
    string? ShippingAddressLine2,
    string ShippingCity,
    string ShippingGovernorate,
    string ShippingPostalCode,
    IReadOnlyList<OrderAdminItemDto> Items);

// ── Repository interface ──────────────────────────────────────────────────────

public interface IOrderAdminRepository
{
    Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct = default);
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
    void Update(Order order);
    Task SaveChangesAsync(CancellationToken ct = default);
}

// ── Queries ───────────────────────────────────────────────────────────────────

public sealed record GetAllOrdersQuery : IQuery<IReadOnlyList<OrderAdminSummaryDto>>;

internal sealed class GetAllOrdersHandler(IOrderAdminRepository repo)
    : IQueryHandler<GetAllOrdersQuery, IReadOnlyList<OrderAdminSummaryDto>>
{
    public async Task<Result<IReadOnlyList<OrderAdminSummaryDto>>> Handle(
        GetAllOrdersQuery request, CancellationToken ct)
    {
        var orders = await repo.GetAllAsync(ct);
        var dtos = orders.Select(o => new OrderAdminSummaryDto(
            o.Id, o.OrderNumber, o.UserId, o.Status.ToString(),
            o.Total, o.Items.Count, o.PlacedAt)).ToList();
        return Result.Success<IReadOnlyList<OrderAdminSummaryDto>>(dtos);
    }
}

public sealed record GetOrderAdminDetailQuery(Guid OrderId)
    : IQuery<OrderAdminDetailDto?>;

internal sealed class GetOrderAdminDetailHandler(IOrderAdminRepository repo)
    : IQueryHandler<GetOrderAdminDetailQuery, OrderAdminDetailDto?>
{
    public async Task<Result<OrderAdminDetailDto?>> Handle(
        GetOrderAdminDetailQuery request, CancellationToken ct)
    {
        var o = await repo.GetByIdAsync(request.OrderId, ct);
        if (o is null)
            return Result.Success<OrderAdminDetailDto?>(null);

        var items = o.Items.Select(i => new OrderAdminItemDto(
            i.Id, i.ProductId, i.SKU, i.Name,
            i.UnitPrice, i.Quantity, i.SubTotal, i.ImageUrl)).ToList();

        var dto = new OrderAdminDetailDto(
            o.Id, o.OrderNumber, o.UserId, o.Status.ToString(),
            o.SubTotal, o.DiscountAmount, o.ShippingFee, o.Total,
            o.CouponCode, o.Notes, o.PlacedAt,
            o.ShippingAddress.FullName, o.ShippingAddress.Phone,
            o.ShippingAddress.AddressLine1, o.ShippingAddress.AddressLine2,
            o.ShippingAddress.City, o.ShippingAddress.Governorate,
            o.ShippingAddress.PostalCode, items);

        return Result.Success<OrderAdminDetailDto?>(dto);
    }
}

// ── Commands ──────────────────────────────────────────────────────────────────

public sealed record UpdateOrderStatusCommand(Guid OrderId, string Status) : ICommand;

internal sealed class UpdateOrderStatusHandler(IOrderAdminRepository repo)
    : ICommandHandler<UpdateOrderStatusCommand>
{
    public async Task<Result> Handle(UpdateOrderStatusCommand request, CancellationToken ct)
    {
        if (!Enum.TryParse<OrderStatus>(request.Status, ignoreCase: true, out var status))
            return Result.Failure(new Error("Orders.InvalidStatus",
                $"'{request.Status}' is not a valid order status."));

        var order = await repo.GetByIdAsync(request.OrderId, ct);
        if (order is null)
            return Result.Failure(Error.NotFound("Orders.NotFound",
                $"Order {request.OrderId} not found."));

        order.UpdateStatus(status);
        repo.Update(order);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
