using PartZone.Identity.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Identity.Application.Queries;

public sealed record UserAdminDto(
    Guid Id, string Email, string FirstName, string LastName, string Role, DateTime CreatedAt);

public sealed record GetAllUsersQuery : IQuery<IReadOnlyList<UserAdminDto>>;

internal sealed class GetAllUsersHandler(IIdentityRepository repo)
    : IQueryHandler<GetAllUsersQuery, IReadOnlyList<UserAdminDto>>
{
    public async Task<Result<IReadOnlyList<UserAdminDto>>> Handle(GetAllUsersQuery _, CancellationToken ct)
    {
        var users = await repo.GetAllAsync(ct);
        var dtos = users
            .Select(u => new UserAdminDto(u.Id, u.Email, u.FirstName, u.LastName, u.Role.ToString(), u.CreatedAt))
            .ToList()
            .AsReadOnly();
        return Result.Success<IReadOnlyList<UserAdminDto>>(dtos);
    }
}
