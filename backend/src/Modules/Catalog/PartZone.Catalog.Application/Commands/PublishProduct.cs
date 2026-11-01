using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record PublishProductCommand(Guid Id) : ICommand;

internal sealed class PublishProductHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<PublishProductCommand>
{
    public async Task<Result> Handle(PublishProductCommand request, CancellationToken ct)
    {
        var product = await read.GetProductByIdAsync(request.Id, ct);
        if (product is null) return Result.Failure(Error.NotFound("Product.NotFound", $"Product {request.Id} not found."));
        product.Publish();
        write.UpdateProduct(product);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
