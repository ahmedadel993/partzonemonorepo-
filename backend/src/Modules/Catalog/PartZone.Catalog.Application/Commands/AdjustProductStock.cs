using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record AdjustProductStockCommand(Guid ProductId, int Delta) : ICommand;

internal sealed class AdjustProductStockHandler(
    ICatalogReadRepository read,
    ICatalogWriteRepository write)
    : ICommandHandler<AdjustProductStockCommand>
{
    public async Task<Result> Handle(AdjustProductStockCommand request, CancellationToken ct)
    {
        var product = await read.GetProductByIdAsync(request.ProductId, ct);
        if (product is null)
            return Result.Failure(Error.NotFound("Catalog.ProductNotFound", "Product not found."));

        product.UpdateStock(Math.Max(0, product.Stock + request.Delta));
        write.UpdateProduct(product);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
