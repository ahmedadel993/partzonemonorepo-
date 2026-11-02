using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Commands;

public sealed record ReorderItem(Guid Id, int SortOrder);

public sealed record ReorderPageBlocksCommand(IReadOnlyList<ReorderItem> Items) : ICommand;

internal sealed class ReorderPageBlocksHandler(IPageBlockRepository repo)
    : ICommandHandler<ReorderPageBlocksCommand>
{
    public async Task<Result> Handle(ReorderPageBlocksCommand request, CancellationToken ct)
    {
        foreach (var item in request.Items)
        {
            var block = await repo.GetByIdAsync(item.Id, ct);
            if (block is null) continue;
            block.Reorder(item.SortOrder);
            repo.Update(block);
        }
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
