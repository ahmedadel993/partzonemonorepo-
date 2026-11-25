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
    Task<bool> UpdateAddressAsync(Guid addressId, Guid userId, string label, string streetLine1, string? streetLine2, string city, string governorate, string postalCode, CancellationToken ct = default);
    Task<bool> SetDefaultAddressAsync(Guid addressId, Guid userId, CancellationToken ct = default);
    Task<bool> DeleteAddressAsync(Guid addressId, Guid userId, CancellationToken ct = default);
    void UpdateUser(User user);
    Task DeleteUserAsync(Guid userId, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
