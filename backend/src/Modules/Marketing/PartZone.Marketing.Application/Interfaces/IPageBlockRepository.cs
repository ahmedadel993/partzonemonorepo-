using PartZone.Marketing.Domain.Entities;

namespace PartZone.Marketing.Application.Interfaces;

public interface IPageBlockRepository
{
    Task<IReadOnlyList<PageBlock>> GetActiveBlocksAsync(CancellationToken ct);
    Task<IReadOnlyList<PageBlock>> GetAllBlocksAsync(CancellationToken ct);
    Task<PageBlock?> GetByIdAsync(Guid id, CancellationToken ct);
    void Add(PageBlock block);
    void Update(PageBlock block);
    Task SaveChangesAsync(CancellationToken ct);
}
