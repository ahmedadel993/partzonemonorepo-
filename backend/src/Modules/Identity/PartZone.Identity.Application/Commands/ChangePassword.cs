using FluentValidation;
using PartZone.Identity.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Identity.Application.Commands;

public sealed record ChangePasswordCommand(
    Guid UserId, string CurrentPassword, string NewPassword)
    : ICommand;

public sealed class ChangePasswordValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8);
    }
}

public sealed class ChangePasswordHandler(IIdentityRepository repo, IPasswordHasher hasher)
    : ICommandHandler<ChangePasswordCommand>
{
    public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken ct)
    {
        var user = await repo.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result.Failure(Error.NotFound("Identity.UserNotFound", "User not found."));
        if (!hasher.Verify(request.CurrentPassword, user.PasswordHash))
            return Result.Failure(Error.Unauthorized("Identity.InvalidCredentials", "Current password is incorrect."));
        user.UpdatePassword(hasher.Hash(request.NewPassword));
        repo.UpdateUser(user);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
