using FluentValidation;
using PartZone.Identity.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Identity.Application.Commands;

public sealed record UpdateMyProfileCommand(
    Guid UserId, string FirstName, string LastName, string? PhoneNumber)
    : ICommand;

public sealed class UpdateMyProfileValidator : AbstractValidator<UpdateMyProfileCommand>
{
    public UpdateMyProfileValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
    }
}

public sealed class UpdateMyProfileHandler(IIdentityRepository repo)
    : ICommandHandler<UpdateMyProfileCommand>
{
    public async Task<Result> Handle(UpdateMyProfileCommand request, CancellationToken ct)
    {
        var user = await repo.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result.Failure(Error.NotFound("Identity.UserNotFound", "User not found."));
        user.Update(request.FirstName, request.LastName, request.PhoneNumber);
        repo.UpdateUser(user);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
