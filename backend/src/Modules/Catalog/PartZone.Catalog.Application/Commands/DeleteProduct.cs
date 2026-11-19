using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record DeleteProductCommand(Guid Id) : ICommand;

internal sealed class DeleteProductHandler(ICatalogReadRepository read, ICatalogWriteRepository write)
    : ICommandHandler<DeleteProductCommand>
{
    public async Task<Result> Handle(DeleteProductCommand req, CancellationToken ct)
    {
        var product = await read.GetProductByIdAsync(req.Id, ct);
        if (product is null) return Result.Failure(Error.NotFound("Product.NotFound", "المنتج غير موجود"));
        write.RemoveProduct(product);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
