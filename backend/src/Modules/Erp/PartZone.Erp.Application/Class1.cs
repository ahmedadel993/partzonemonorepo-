using Microsoft.Extensions.DependencyInjection;
using PartZone.Erp.Domain;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Erp.Application;

// ── Repository interfaces ─────────────────────────────────────────────────────

public interface IErpRepository
{
    void AddAdjustment(StockAdjustment adj);
    Task SaveChangesAsync(CancellationToken ct = default);
}

public interface IInventoryProductRepository
{
    Task<IReadOnlyList<LowStockProductDto>> GetLowStockAsync(int threshold, CancellationToken ct = default);
    Task<int?> GetCurrentStockAsync(Guid productId, CancellationToken ct = default);
    Task UpdateStockAsync(Guid productId, int newStock, CancellationToken ct = default);
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

public sealed record LowStockProductDto(Guid Id, string Sku, string Name, int Stock);

// ── Queries ───────────────────────────────────────────────────────────────────

public sealed record GetLowStockProductsQuery(int Threshold = 5) : IQuery<IReadOnlyList<LowStockProductDto>>;

internal sealed class GetLowStockProductsHandler(IInventoryProductRepository repo)
    : IQueryHandler<GetLowStockProductsQuery, IReadOnlyList<LowStockProductDto>>
{
    public async Task<Result<IReadOnlyList<LowStockProductDto>>> Handle(
        GetLowStockProductsQuery request, CancellationToken ct)
    {
        var items = await repo.GetLowStockAsync(request.Threshold, ct);
        return Result.Success(items);
    }
}

// ── Commands ──────────────────────────────────────────────────────────────────

public sealed record CreateStockAdjustmentCommand(
    Guid ProductId,
    int Delta,
    string Reason,
    Guid AdminUserId) : ICommand;

internal sealed class CreateStockAdjustmentHandler(
    IErpRepository erp,
    IInventoryProductRepository inventory)
    : ICommandHandler<CreateStockAdjustmentCommand>
{
    public async Task<Result> Handle(CreateStockAdjustmentCommand request, CancellationToken ct)
    {
        var currentStock = await inventory.GetCurrentStockAsync(request.ProductId, ct);
        if (currentStock is null)
            return Result.Failure(Error.NotFound("Erp.ProductNotFound", "Product not found."));

        var newStock = Math.Max(0, currentStock.Value + request.Delta);

        var adjustment = StockAdjustment.Create(request.ProductId, request.Delta, request.Reason, request.AdminUserId);
        erp.AddAdjustment(adjustment);

        await inventory.UpdateStockAsync(request.ProductId, newStock, ct);
        await erp.SaveChangesAsync(ct);

        return Result.Success();
    }
}

// ── DI ────────────────────────────────────────────────────────────────────────

public static class ErpApplicationExtensions
{
    public static IServiceCollection AddErpApplication(this IServiceCollection services) => services;
}
