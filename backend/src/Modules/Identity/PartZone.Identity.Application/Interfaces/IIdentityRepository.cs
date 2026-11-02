using PartZone.Identity.Domain.Entities;

namespace PartZone.Identity.Application.Interfaces;

public interface IIdentityRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
    Task AddRefreshTokenAsync(RefreshToken token, CancellationToken ct = default);
    Task<RefreshToken?> GetRefreshTokenAsync(string token, CancellationToken ct = default);
    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Address>> GetAddressesByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task AddAddressAsync(Address address, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
