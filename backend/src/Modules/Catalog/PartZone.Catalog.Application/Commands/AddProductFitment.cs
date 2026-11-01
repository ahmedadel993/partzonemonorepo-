using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record AddProductFitmentCommand(Guid ProductId, Guid ModelId, int YearFrom, int YearTo) : ICommand;

internal sealed class AddProductFitmentHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<AddProductFitmentCommand>
{
    public async Task<Result> Handle(AddProductFitmentCommand request, CancellationToken ct)
    {
        var product = await read.GetProductByIdAsync(request.ProductId, ct);
        if (product is null) return Result.Failure(Error.NotFound("Product.NotFound", $"Product {request.ProductId} not found."));
        product.AddFitment(request.ModelId, request.YearFrom, request.YearTo);
        write.UpdateProduct(product);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
