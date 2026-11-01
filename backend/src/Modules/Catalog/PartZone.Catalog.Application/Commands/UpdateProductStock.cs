using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record UpdateProductStockCommand(Guid Id, int Quantity) : ICommand;

internal sealed class UpdateProductStockHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<UpdateProductStockCommand>
{
    public async Task<Result> Handle(UpdateProductStockCommand request, CancellationToken ct)
    {
        var product = await read.GetProductByIdAsync(request.Id, ct);
        if (product is null) return Result.Failure(Error.NotFound("Product.NotFound", $"Product {request.Id} not found."));
        product.UpdateStock(request.Quantity);
        write.UpdateProduct(product);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
