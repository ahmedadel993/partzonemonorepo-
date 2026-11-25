using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Commands;

public sealed record ReorderPaymentMethodsCommand(IReadOnlyList<ReorderItem> Items) : ICommand;

internal sealed class ReorderPaymentMethodsHandler(IPaymentMethodRepository repo)
    : ICommandHandler<ReorderPaymentMethodsCommand>
{
    public async Task<Result> Handle(ReorderPaymentMethodsCommand request, CancellationToken ct)
    {
        foreach (var item in request.Items)
        {
            var pm = await repo.GetByIdAsync(item.Id, ct);
            if (pm is null) continue;
            pm.Reorder(item.SortOrder);
            repo.Update(pm);
        }
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
