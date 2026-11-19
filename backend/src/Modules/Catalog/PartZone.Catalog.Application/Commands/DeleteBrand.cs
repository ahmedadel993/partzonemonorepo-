using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record DeleteBrandCommand(Guid Id) : ICommand;

internal sealed class DeleteBrandHandler(ICatalogReadRepository read, ICatalogWriteRepository write)
    : ICommandHandler<DeleteBrandCommand>
{
    public async Task<Result> Handle(DeleteBrandCommand req, CancellationToken ct)
    {
        var brand = await read.GetBrandByIdAsync(req.Id, ct);
        if (brand is null) return Result.Failure(Error.NotFound("Brand.NotFound", "الماركة غير موجودة"));
        write.RemoveBrand(brand);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
