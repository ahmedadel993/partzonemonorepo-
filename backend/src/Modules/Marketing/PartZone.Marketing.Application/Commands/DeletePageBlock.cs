using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Commands;

public sealed record DeletePageBlockCommand(Guid Id) : ICommand;

internal sealed class DeletePageBlockHandler(IPageBlockRepository repo)
    : ICommandHandler<DeletePageBlockCommand>
{
    public async Task<Result> Handle(DeletePageBlockCommand request, CancellationToken ct)
    {
        var block = await repo.GetByIdAsync(request.Id, ct);
        if (block is null)
            return Result.Failure(Error.NotFound("PageBlock.NotFound", $"Page block {request.Id} not found."));

        // Translations are removed by the database (ON DELETE CASCADE).
        repo.Remove(block);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
