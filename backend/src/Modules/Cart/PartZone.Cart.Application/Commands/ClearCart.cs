using PartZone.Cart.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Cart.Application.Commands;

public sealed record ClearCartCommand(Guid UserId) : ICommand;

internal sealed class ClearCartHandler(ICartRepository repo)
    : ICommandHandler<ClearCartCommand>
{
    public async Task<Result> Handle(ClearCartCommand request, CancellationToken ct)
    {
        var cart = await repo.GetByUserIdAsync(request.UserId, ct);
        if (cart is null) return Result.Success();
        cart.Clear();
        repo.Update(cart);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
