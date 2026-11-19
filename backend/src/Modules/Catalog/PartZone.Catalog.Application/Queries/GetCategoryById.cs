// Phase 8 – Bug fix: added GetCategoryByIdQuery so UpdateCategory can re-query after save
using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetCategoryByIdQuery(Guid Id) : IQuery<CategoryDto?>;

internal sealed class GetCategoryByIdHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetCategoryByIdQuery, CategoryDto?>
{
    public async Task<Result<CategoryDto?>> Handle(GetCategoryByIdQuery request, CancellationToken ct)
    {
        var c = await repo.GetCategoryByIdAsync(request.Id, ct);
        if (c is null) return Result.Success<CategoryDto?>(null);
        return Result.Success<CategoryDto?>(
            new CategoryDto(c.Id, c.Name, c.Slug, c.ImageUrl, c.SortOrder, c.ParentId,
                c.IsActive, c.IsFeatured, c.ShowInHome, c.ShowInMenu,
                c.Children.Select(ch => new CategoryDto(ch.Id, ch.Name, ch.Slug, ch.ImageUrl,
                    ch.SortOrder, ch.ParentId, ch.IsActive, ch.IsFeatured, ch.ShowInHome, ch.ShowInMenu, [])).ToList()));
    }
}
