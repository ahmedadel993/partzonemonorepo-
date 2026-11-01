using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;

namespace PartZone.Catalog.Application.Queries;

public sealed record GetCategoriesQuery : IQuery<IReadOnlyList<CategoryDto>>;

internal sealed class GetCategoriesHandler(ICatalogReadRepository repo)
    : IQueryHandler<GetCategoriesQuery, IReadOnlyList<CategoryDto>>
{
    public async Task<IReadOnlyList<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken ct)
    {
        var categories = await repo.GetCategoriesAsync(ct);
        return categories.Where(c => c.ParentId is null).Select(Map).ToList();
    }

    private static CategoryDto Map(PartZone.Catalog.Domain.Entities.Category c) =>
        new(c.Id, c.Name, c.Slug, c.ImageUrl, c.SortOrder, c.ParentId,
            c.Children.Select(Map).ToList());
}
