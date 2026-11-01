using Microsoft.EntityFrameworkCore;
using PartZone.Identity.Application.Interfaces;
using PartZone.Identity.Domain.Entities;

namespace PartZone.Identity.Infrastructure;

public sealed class IdentityRepository : IIdentityRepository
{
    private readonly DbContext _ctx;

    public IdentityRepository(DbContext ctx) => _ctx = ctx;

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

    public Task SaveChangesAsync(CancellationToken ct) =>
        _ctx.SaveChangesAsync(ct);
}
