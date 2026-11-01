using MediatR;
using PartZone.Catalog.Application.Queries;

namespace PartZone.Catalog.Api;

[ExtendObjectType("Query")]
public sealed class CatalogQueryResolvers
{
    public async Task<IReadOnlyList<BrandDto>> GetBrandsAsync(
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetBrandsQuery(), ct);
        return result.IsSuccess ? result.Value! : [];
    }

    public async Task<BrandDto?> GetBrandAsync(
        string slug,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetBrandBySlugQuery(slug), ct);
        return result.IsSuccess ? result.Value : null;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCategoriesQuery(), ct);
        return result.IsSuccess ? result.Value! : [];
    }

    public async Task<CategoryDto?> GetCategoryAsync(
        string slug,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCategoryBySlugQuery(slug), ct);
        return result.IsSuccess ? result.Value : null;
    }

    public async Task<PagedResult<ProductSummaryDto>> GetProductsAsync(
        ProductFilterInput filter,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var query = new GetProductsQuery(new ProductFilter
        {
            Q = filter.Q,
            CategoryId = filter.CategoryId,
            BrandId = filter.BrandId,
            Condition = filter.Condition,
            VehicleModelId = filter.VehicleModelId,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 20,
        });
        var result = await mediator.Send(query, ct);
        return result.IsSuccess
            ? result.Value!
            : new PagedResult<ProductSummaryDto>([], 0, 1, 20);
    }

    public async Task<ProductDetailDto?> GetProductAsync(
        string slug,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetProductBySlugQuery(slug), ct);
        return result.IsSuccess ? result.Value : null;
    }

    public async Task<IReadOnlyList<VehicleMakeDto>> GetVehicleMakesAsync(
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetVehicleMakesQuery(), ct);
        return result.IsSuccess ? result.Value! : [];
    }

    public async Task<IReadOnlyList<VehicleModelDto>> GetVehicleModelsAsync(
        Guid makeId,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetVehicleModelsByMakeQuery(makeId), ct);
        return result.IsSuccess ? result.Value! : [];
    }

    public async Task<IReadOnlyList<VehicleYearRangeDto>> GetVehicleYearsAsync(
        Guid modelId,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetVehicleYearsByModelQuery(modelId), ct);
        return result.IsSuccess ? result.Value! : [];
    }
}

public sealed record ProductFilterInput(
    string? Q,
    Guid? CategoryId,
    Guid? BrandId,
    string? Condition,
    Guid? VehicleModelId,
    int? Page,
    int? PageSize);
