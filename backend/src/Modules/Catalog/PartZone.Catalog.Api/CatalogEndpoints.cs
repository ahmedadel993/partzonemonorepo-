using MediatR;
using Microsoft.AspNetCore.Http;
using PartZone.Catalog.Application.Commands;
using PartZone.Catalog.Application.Queries;
using PartZone.Catalog.Domain.Enums;

namespace PartZone.Catalog.Api;

internal static class CatalogEndpoints
{
    internal static async Task<IResult> GetBrandsAsync(IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetBrandsQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> GetBrandAsync(string slug, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetBrandBySlugQuery(slug), ct);
        if (!result.IsSuccess) return Results.Problem(result.Error.Description);
        return result.Value is null ? Results.NotFound() : Results.Ok(result.Value);
    }

    internal static async Task<IResult> CreateBrandAsync(
        CreateBrandRequest req, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateBrandCommand(req.Name, req.Slug, req.LogoUrl), ct);
        return result.IsSuccess
            ? Results.Created($"/api/v1/catalog/brands/{req.Slug}", new { id = result.Value })
            : Results.Problem(result.Error.Description, statusCode: StatusCodes.Status409Conflict);
    }

    internal static async Task<IResult> UpdateBrandAsync(
        Guid id, UpdateBrandRequest req, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateBrandCommand(id, req.Name, req.LogoUrl), ct);
        return result.IsSuccess ? Results.NoContent() : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> GetCategoriesAsync(IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCategoriesQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> GetCategoryAsync(string slug, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCategoryBySlugQuery(slug), ct);
        if (!result.IsSuccess) return Results.Problem(result.Error.Description);
        return result.Value is null ? Results.NotFound() : Results.Ok(result.Value);
    }

    internal static async Task<IResult> CreateCategoryAsync(
        CreateCategoryRequest req, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new CreateCategoryCommand(req.Name, req.Slug, req.ParentId, req.SortOrder), ct);
        return result.IsSuccess
            ? Results.Created($"/api/v1/catalog/categories/{req.Slug}", new { id = result.Value })
            : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> GetProductsAsync(
        [AsParameters] ProductQueryParams p, IMediator mediator, CancellationToken ct)
    {
        var filter = new ProductFilter
        {
            Q = p.Q,
            CategoryId = p.CategoryId,
            BrandId = p.BrandId,
            Condition = p.Condition,
            VehicleModelId = p.VehicleModelId,
            Page = p.Page ?? 1,
            PageSize = p.PageSize ?? 20,
        };
        var result = await mediator.Send(new GetProductsQuery(filter), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> GetProductAsync(string slug, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetProductBySlugQuery(slug), ct);
        if (!result.IsSuccess) return Results.Problem(result.Error.Description);
        return result.Value is null ? Results.NotFound() : Results.Ok(result.Value);
    }

    internal static async Task<IResult> CreateProductAsync(
        CreateProductRequest req, IMediator mediator, CancellationToken ct)
    {
        if (!Enum.TryParse<PartCondition>(req.Condition, ignoreCase: true, out var condition))
            return Results.Problem($"Invalid condition: {req.Condition}", statusCode: StatusCodes.Status400BadRequest);

        var translations = req.Translations
            .Select(t => new ProductTranslationInput(t.Locale, t.Name, t.Description))
            .ToList();

        var result = await mediator.Send(new CreateProductCommand(
            req.Sku, req.Slug, req.OemNumber, req.BrandId, req.CategoryId,
            condition, req.PriceAmount, req.PriceCurrency, req.Stock, translations), ct);

        return result.IsSuccess
            ? Results.Created($"/api/v1/catalog/products/{req.Slug}", new { id = result.Value })
            : Results.Problem(result.Error.Description, statusCode: StatusCodes.Status409Conflict);
    }

    internal static async Task<IResult> GetVehicleMakesAsync(IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetVehicleMakesQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> GetVehicleModelsAsync(
        Guid makeId, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetVehicleModelsByMakeQuery(makeId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }

    internal static async Task<IResult> GetVehicleYearsAsync(
        Guid modelId, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetVehicleYearsByModelQuery(modelId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.Problem(result.Error.Description);
    }
}

// ── Request body records ──────────────────────────────────────────────────────

internal sealed record CreateBrandRequest(string Name, string Slug, string? LogoUrl);
internal sealed record UpdateBrandRequest(string Name, string? LogoUrl);
internal sealed record CreateCategoryRequest(string Name, string Slug, string? IconUrl, int SortOrder, Guid? ParentId);

internal sealed record TranslationRequest(string Locale, string Name, string? Description);
internal sealed record CreateProductRequest(
    string Sku, string OemNumber, string Slug, string Condition,
    decimal PriceAmount, string PriceCurrency, int Stock,
    Guid BrandId, Guid CategoryId,
    IReadOnlyList<TranslationRequest> Translations);

internal sealed record ProductQueryParams(
    string? Q, Guid? CategoryId, Guid? BrandId,
    string? Condition, Guid? VehicleModelId,
    int? Page, int? PageSize);
