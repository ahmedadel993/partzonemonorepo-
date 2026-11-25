using Microsoft.EntityFrameworkCore;
using PartZone.Identity.Application.Interfaces;
using PartZone.Identity.Domain.Entities;

namespace PartZone.Identity.Infrastructure;

public sealed class IdentityRepository : IIdentityRepository
{
    private readonly DbContext _ctx;

    public IdentityRepository(DbContext ctx) => _ctx = ctx;

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct)
    {
        var list = await _ctx.Set<User>().OrderByDescending(u => u.CreatedAt).ToListAsync(ct);
        return list.AsReadOnly();
    }

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct) =>
        _ctx.Set<User>().FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _ctx.Set<User>().FindAsync([id], ct).AsTask();

    public async Task AddAsync(User user, CancellationToken ct) =>
        await _ctx.Set<User>().AddAsync(user, ct);

    public async Task AddRefreshTokenAsync(RefreshToken token, CancellationToken ct) =>
        await _ctx.Set<RefreshToken>().AddAsync(token, ct);

    public Task<RefreshToken?> GetRefreshTokenAsync(string token, CancellationToken ct) =>
        _ctx.Set<RefreshToken>().FirstOrDefaultAsync(t => t.Token == token, ct);

    public async Task<IReadOnlyList<Address>> GetAddressesByUserIdAsync(Guid userId, CancellationToken ct)
    {
        var list = await _ctx.Set<Address>()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ToListAsync(ct);
        return list.AsReadOnly();
    }

    public async Task AddAddressAsync(Address address, CancellationToken ct) =>
        await _ctx.Set<Address>().AddAsync(address, ct);

    public async Task<bool> UpdateAddressAsync(Guid addressId, Guid userId, string label, string streetLine1, string? streetLine2, string city, string governorate, string postalCode, CancellationToken ct = default)
    {
        var address = await _ctx.Set<Address>()
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId, ct);
        if (address is null) return false;
        address.Update(label, streetLine1, streetLine2, city, governorate, postalCode);
        await _ctx.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> SetDefaultAddressAsync(Guid addressId, Guid userId, CancellationToken ct = default)
    {
        var addresses = await _ctx.Set<Address>()
            .Where(a => a.UserId == userId)
            .ToListAsync(ct);
        var target = addresses.FirstOrDefault(a => a.Id == addressId);
        if (target is null) return false;
        foreach (var a in addresses) a.ClearDefault();
        target.MakeDefault();
        await _ctx.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeleteAddressAsync(Guid addressId, Guid userId, CancellationToken ct = default)
    {
        var address = await _ctx.Set<Address>()
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId, ct);
        if (address is null) return false;
        _ctx.Set<Address>().Remove(address);
        await _ctx.SaveChangesAsync(ct);
        return true;
    }

    public void UpdateUser(User user) => _ctx.Set<User>().Update(user);

    public async Task DeleteUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _ctx.Set<User>().FindAsync([userId], ct);
        if (user != null)
        {
            _ctx.Set<User>().Remove(user);
            await _ctx.SaveChangesAsync(ct);
        }
    }

    public Task SaveChangesAsync(CancellationToken ct) =>
        _ctx.SaveChangesAsync(ct);
}
