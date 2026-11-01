using FluentValidation;
using PartZone.Identity.Application.Interfaces;
using PartZone.Identity.Domain.Entities;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Identity.Application.Commands;

public sealed record LoginUserCommand(string Email, string Password) : ICommand<LoginUserResponse>;

public sealed record LoginUserResponse(string AccessToken, string RefreshToken, Guid UserId, string Role);

public sealed class LoginUserValidator : AbstractValidator<LoginUserCommand>
{
    public LoginUserValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class LoginUserHandler : ICommandHandler<LoginUserCommand, LoginUserResponse>
{
    private readonly IIdentityRepository _repo;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _hasher;
    private readonly int _refreshExpiryDays;

    public LoginUserHandler(
        IIdentityRepository repo,
        ITokenService tokenService,
        IPasswordHasher hasher,
        JwtSettings jwtSettings)
    {
        _repo = repo;
        _tokenService = tokenService;
        _hasher = hasher;
        _refreshExpiryDays = jwtSettings.RefreshTokenExpiryDays;
    }

    public async Task<Result<LoginUserResponse>> Handle(LoginUserCommand request, CancellationToken ct)
    {
        var user = await _repo.GetByEmailAsync(request.Email, ct);

        if (user is null || !_hasher.Verify(request.Password, user.PasswordHash))
            return Result.Failure<LoginUserResponse>(
                Error.Unauthorized("Identity.InvalidCredentials", "Invalid email or password."));

        if (!user.IsActive)
            return Result.Failure<LoginUserResponse>(
                Error.Unauthorized("Identity.AccountInactive", "Account is inactive."));

        var accessToken = _tokenService.GenerateAccessToken(user);
        var rawRefresh = _tokenService.GenerateRefreshToken();
        var refreshToken = RefreshToken.Create(user.Id, rawRefresh, _refreshExpiryDays);

        await _repo.AddRefreshTokenAsync(refreshToken, ct);
        await _repo.SaveChangesAsync(ct);

        return Result.Success(new LoginUserResponse(accessToken, rawRefresh, user.Id, user.Role.ToString()));
    }
}
