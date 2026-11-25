using PartZone.Identity.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Identity.Application.Commands;

public sealed record ActivateUserCommand(Guid Id) : ICommand;

internal sealed class ActivateUserHandler(IIdentityRepository repo)
    : ICommandHandler<ActivateUserCommand>
{
    public async Task<Result> Handle(ActivateUserCommand request, CancellationToken ct)
    {
        var user = await repo.GetByIdAsync(request.Id, ct);
        if (user is null) return Result.Failure(Error.NotFound("User.NotFound", $"User {request.Id} not found."));
        user.Activate();
        repo.UpdateUser(user);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public sealed record DeactivateUserCommand(Guid Id) : ICommand;

internal sealed class DeactivateUserHandler(IIdentityRepository repo)
    : ICommandHandler<DeactivateUserCommand>
{
    public async Task<Result> Handle(DeactivateUserCommand request, CancellationToken ct)
    {
        var user = await repo.GetByIdAsync(request.Id, ct);
        if (user is null) return Result.Failure(Error.NotFound("User.NotFound", $"User {request.Id} not found."));
        user.Deactivate();
        repo.UpdateUser(user);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
