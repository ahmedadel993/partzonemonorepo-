using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetCategoryBySlugQuery(string Slug) : IQuery<CategoryDto?>;

internal sealed class GetCategoryBySlugHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetCategoryBySlugQuery, CategoryDto?>
{
    public async Task<CategoryDto?> Handle(GetCategoryBySlugQuery request, CancellationToken ct)
    {
        var c = await repo.GetCategoryBySlugAsync(request.Slug, ct);
        if (c is null) return null;
        return new CategoryDto(c.Id, c.Name, c.Slug, c.ImageUrl, c.SortOrder, c.ParentId,
            c.Children.Select(ch => new CategoryDto(ch.Id, ch.Name, ch.Slug, ch.ImageUrl, ch.SortOrder, ch.ParentId, [])).ToList());
    }
}
