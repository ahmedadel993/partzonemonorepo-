using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record UnpublishProductCommand(Guid Id) : ICommand;

internal sealed class UnpublishProductHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<UnpublishProductCommand>
{
    public async Task<Result> Handle(UnpublishProductCommand request, CancellationToken ct)
    {
        var product = await read.GetProductByIdAsync(request.Id, ct);
        if (product is null) return Result.Failure(Error.NotFound("Product.NotFound", $"Product {request.Id} not found."));
        product.Unpublish();
        write.UpdateProduct(product);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
