using FluentValidation;
using PartZone.Identity.Application.Interfaces;
using PartZone.Identity.Domain.Entities;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Identity.Application.Commands;

public sealed record UpdateUserCommand(
    Guid UserId, string FirstName, string LastName, string? PhoneNumber, string? Role)
    : ICommand;

public sealed class UpdateUserValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
    }
}

public sealed class UpdateUserHandler(IIdentityRepository repo)
    : ICommandHandler<UpdateUserCommand>
{
    public async Task<Result> Handle(UpdateUserCommand request, CancellationToken ct)
    {
        var user = await repo.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result.Failure(Error.NotFound("Identity.UserNotFound", "User not found."));

        user.Update(request.FirstName, request.LastName, request.PhoneNumber);

        if (request.Role is not null)
        {
            if (!Enum.TryParse<UserRole>(request.Role, ignoreCase: true, out var newRole))
                return Result.Failure(Error.Validation("Identity.InvalidRole", $"'{request.Role}' is not a valid role."));
            user.ChangeRole(newRole);
        }

        repo.UpdateUser(user);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
