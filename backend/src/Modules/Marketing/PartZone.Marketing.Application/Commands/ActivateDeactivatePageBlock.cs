using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Commands;

public sealed record ActivatePageBlockCommand(Guid Id) : ICommand;

internal sealed class ActivatePageBlockHandler(IPageBlockRepository repo)
    : ICommandHandler<ActivatePageBlockCommand>
{
    public async Task<Result> Handle(ActivatePageBlockCommand request, CancellationToken ct)
    {
        var block = await repo.GetByIdAsync(request.Id, ct);
        if (block is null)
            return Result.Failure(Error.NotFound("PageBlock.NotFound", $"Page block {request.Id} not found."));
        block.Activate();
        repo.Update(block);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public sealed record DeactivatePageBlockCommand(Guid Id) : ICommand;

internal sealed class DeactivatePageBlockHandler(IPageBlockRepository repo)
    : ICommandHandler<DeactivatePageBlockCommand>
{
    public async Task<Result> Handle(DeactivatePageBlockCommand request, CancellationToken ct)
    {
        var block = await repo.GetByIdAsync(request.Id, ct);
        if (block is null)
            return Result.Failure(Error.NotFound("PageBlock.NotFound", $"Page block {request.Id} not found."));
        block.Deactivate();
        repo.Update(block);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
