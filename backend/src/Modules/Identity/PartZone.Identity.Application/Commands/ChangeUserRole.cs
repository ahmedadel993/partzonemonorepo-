using PartZone.Identity.Application.Interfaces;
using PartZone.Identity.Domain.Entities;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Identity.Application.Commands;

public sealed record ChangeUserRoleCommand(Guid UserId, string Role) : ICommand;

internal sealed class ChangeUserRoleHandler(IIdentityRepository repo)
    : ICommandHandler<ChangeUserRoleCommand>
{
    public async Task<Result> Handle(ChangeUserRoleCommand request, CancellationToken ct)
    {
        if (!Enum.TryParse<UserRole>(request.Role, ignoreCase: true, out var newRole))
            return Result.Failure(new Error("Identity.InvalidRole",
                $"'{request.Role}' is not a valid role."));

        var user = await repo.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result.Failure(Error.NotFound("Identity.UserNotFound", "User not found."));

        user.ChangeRole(newRole);
        repo.UpdateUser(user);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
