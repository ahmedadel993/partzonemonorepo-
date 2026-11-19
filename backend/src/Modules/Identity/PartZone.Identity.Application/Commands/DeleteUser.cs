using PartZone.Identity.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Identity.Application.Commands;

public sealed record DeleteUserCommand(Guid UserId) : ICommand;

public sealed class DeleteUserHandler(IIdentityRepository repo)
    : ICommandHandler<DeleteUserCommand>
{
    public async Task<Result> Handle(DeleteUserCommand request, CancellationToken ct)
    {
        var user = await repo.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result.Failure(Error.NotFound("Identity.UserNotFound", "User not found."));
        await repo.DeleteUserAsync(request.UserId, ct);
        return Result.Success();
    }
}
