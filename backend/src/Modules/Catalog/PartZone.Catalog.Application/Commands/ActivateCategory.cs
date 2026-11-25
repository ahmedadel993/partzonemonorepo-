using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record ActivateCategoryCommand(Guid Id) : ICommand;

internal sealed class ActivateCategoryHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<ActivateCategoryCommand>
{
    public async Task<Result> Handle(ActivateCategoryCommand request, CancellationToken ct)
    {
        var category = await read.GetCategoryByIdAsync(request.Id, ct);
        if (category is null) return Result.Failure(Error.NotFound("Category.NotFound", $"Category {request.Id} not found."));
        category.Activate();
        write.UpdateCategory(category);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public sealed record DeactivateCategoryCommand(Guid Id) : ICommand;

internal sealed class DeactivateCategoryHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<DeactivateCategoryCommand>
{
    public async Task<Result> Handle(DeactivateCategoryCommand request, CancellationToken ct)
    {
        var category = await read.GetCategoryByIdAsync(request.Id, ct);
        if (category is null) return Result.Failure(Error.NotFound("Category.NotFound", $"Category {request.Id} not found."));
        category.Deactivate();
        write.UpdateCategory(category);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
