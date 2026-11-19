using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record DeleteCategoryCommand(Guid Id) : ICommand;

internal sealed class DeleteCategoryHandler(ICatalogReadRepository read, ICatalogWriteRepository write)
    : ICommandHandler<DeleteCategoryCommand>
{
    public async Task<Result> Handle(DeleteCategoryCommand req, CancellationToken ct)
    {
        var category = await read.GetCategoryByIdAsync(req.Id, ct);
        if (category is null) return Result.Failure(Error.NotFound("Category.NotFound", "التصنيف غير موجود"));
        write.RemoveCategory(category);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
