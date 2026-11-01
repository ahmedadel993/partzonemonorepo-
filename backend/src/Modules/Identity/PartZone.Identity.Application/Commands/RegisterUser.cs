using FluentValidation;
using PartZone.Identity.Application.Interfaces;
using PartZone.Identity.Domain.Entities;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Identity.Application.Commands;

public sealed record RegisterUserCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName) : ICommand<RegisterUserResponse>;

public sealed record RegisterUserResponse(Guid UserId);

public sealed class RegisterUserValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
    }
}

public sealed class RegisterUserHandler : ICommandHandler<RegisterUserCommand, RegisterUserResponse>
{
    private readonly IIdentityRepository _repo;
    private readonly IPasswordHasher _hasher;

    public RegisterUserHandler(IIdentityRepository repo, IPasswordHasher hasher)
    {
        _repo = repo;
        _hasher = hasher;
    }

    public async Task<Result<RegisterUserResponse>> Handle(
        RegisterUserCommand request,
        CancellationToken ct)
    {
        var existing = await _repo.GetByEmailAsync(request.Email, ct);
        if (existing is not null)
            return Result.Failure<RegisterUserResponse>(
                Error.Conflict("Identity.EmailTaken", "An account with this email already exists."));

        var hash = _hasher.Hash(request.Password);
        var user = User.Create(request.Email, hash, request.FirstName, request.LastName);

        await _repo.AddAsync(user, ct);
        await _repo.SaveChangesAsync(ct);

        return Result.Success(new RegisterUserResponse(user.Id));
    }
}
