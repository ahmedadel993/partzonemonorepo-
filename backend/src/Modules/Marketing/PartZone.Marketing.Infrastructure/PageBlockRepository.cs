using Microsoft.EntityFrameworkCore;
using PartZone.Marketing.Application.Interfaces;
using PartZone.Marketing.Domain.Entities;

namespace PartZone.Marketing.Infrastructure;

internal sealed class PageBlockRepository(DbContext db) : IPageBlockRepository
{
    private DbSet<PageBlock> Set => db.Set<PageBlock>();

    public async Task<IReadOnlyList<PageBlock>> GetActiveBlocksAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        return await Set
            .Include(b => b.Translations)
            .Where(b => b.IsActive
                && (b.ActiveFrom == null || b.ActiveFrom <= now)
                && (b.ActiveTo == null || b.ActiveTo >= now))
            // Tie-break so blocks with the same SortOrder keep a stable order.
            .OrderBy(b => b.SortOrder).ThenBy(b => b.CreatedAt).ThenBy(b => b.Id)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<PageBlock>> GetAllBlocksAsync(CancellationToken ct) =>
        await Set.Include(b => b.Translations)
            .OrderBy(b => b.SortOrder).ThenBy(b => b.CreatedAt).ThenBy(b => b.Id)
            .ToListAsync(ct);

    public async Task<PageBlock?> GetByIdAsync(Guid id, CancellationToken ct) =>
        await Set.Include(b => b.Translations).FirstOrDefaultAsync(b => b.Id == id, ct);

    public void Add(PageBlock block) => Set.Add(block);
    public void Update(PageBlock block) => Set.Update(block);
    public void Remove(PageBlock block) => Set.Remove(block);
    public void AddTranslation(PageBlockTranslation translation) => db.Set<PageBlockTranslation>().Add(translation);
    public async Task SaveChangesAsync(CancellationToken ct) => await db.SaveChangesAsync(ct);
}
