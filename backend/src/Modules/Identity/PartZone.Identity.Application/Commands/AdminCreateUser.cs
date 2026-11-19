using FluentValidation;
using PartZone.Identity.Application.Interfaces;
using PartZone.Identity.Domain.Entities;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Identity.Application.Commands;

public sealed record AdminCreateUserCommand(
    string Email, string Password, string FirstName, string LastName, string Role)
    : ICommand<Guid>;

public sealed class AdminCreateUserValidator : AbstractValidator<AdminCreateUserCommand>
{
    public AdminCreateUserValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Role).NotEmpty();
    }
}

public sealed class AdminCreateUserHandler(IIdentityRepository repo, IPasswordHasher hasher)
    : ICommandHandler<AdminCreateUserCommand, Guid>
{
    public async Task<Result<Guid>> Handle(AdminCreateUserCommand request, CancellationToken ct)
    {
        var existing = await repo.GetByEmailAsync(request.Email, ct);
        if (existing is not null)
            return Result.Failure<Guid>(Error.Conflict("Identity.EmailTaken", "An account with this email already exists."));

        if (!Enum.TryParse<UserRole>(request.Role, ignoreCase: true, out var role))
            return Result.Failure<Guid>(Error.Validation("Identity.InvalidRole", $"'{request.Role}' is not a valid role."));

        var hash = hasher.Hash(request.Password);
        var user = User.Create(request.Email, hash, request.FirstName, request.LastName, role);
        await repo.AddAsync(user, ct);
        await repo.SaveChangesAsync(ct);
        return Result.Success(user.Id);
    }
}
