using MediatR;
using PartZone.Catalog.Application.Commands;
using PartZone.Catalog.Application.Queries;
using PartZone.Catalog.Domain.Enums;

namespace PartZone.Catalog.Api;

[ExtendObjectType("Mutation")]
public sealed class CatalogMutationResolvers
{
    public async Task<BrandPayload> CreateBrandAsync(
        CreateBrandGqlInput input,
        [Service] IMediator mediator,
        [Service] ISender sender,
        CancellationToken ct)
    {
        var result = await mediator.Send(new CreateBrandCommand(input.Name, input.Slug, input.LogoUrl), ct);
        if (!result.IsSuccess)
            return new BrandPayload(null, [result.Error.Description]);

        var brand = await mediator.Send(new GetBrandBySlugQuery(input.Slug), ct);
        return new BrandPayload(brand.IsSuccess ? brand.Value : null, []);
    }

    public async Task<BrandPayload> UpdateBrandAsync(
        UpdateBrandGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateBrandCommand(input.Id, input.Name, input.LogoUrl), ct);
        if (!result.IsSuccess)
            return new BrandPayload(null, [result.Error.Description]);

        var brand = await mediator.Send(new GetBrandByIdQuery(input.Id), ct);
        return new BrandPayload(brand.IsSuccess ? brand.Value : null, []);
    }

    public async Task<CategoryPayload> CreateCategoryAsync(
        CreateCategoryGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new CreateCategoryCommand(input.Name, input.Slug, input.ParentId, input.SortOrder), ct);
        if (!result.IsSuccess)
            return new CategoryPayload(null, [result.Error.Description]);

        var category = await mediator.Send(new GetCategoryBySlugQuery(input.Slug), ct);
        return new CategoryPayload(category.IsSuccess ? category.Value : null, []);
    }

    public async Task<CategoryPayload> UpdateCategoryAsync(
        UpdateCategoryGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new UpdateCategoryCommand(input.Id, input.Name, input.ImageUrl, input.SortOrder), ct);
        return result.IsSuccess
            ? new CategoryPayload(null, [])
            : new CategoryPayload(null, [result.Error.Description]);
    }

    public async Task<VehicleMakePayload> CreateVehicleMakeAsync(
        CreateVehicleMakeGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateVehicleMakeCommand(input.Name, input.Slug), ct);
        if (!result.IsSuccess)
            return new VehicleMakePayload(null, [result.Error.Description]);

        return new VehicleMakePayload(
            new VehicleMakeDto(result.Value!, input.Name, input.Slug, input.LogoUrl), []);
    }

    public async Task<VehicleModelPayload> CreateVehicleModelAsync(
        CreateVehicleModelGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new CreateVehicleModelCommand(input.VehicleMakeId, input.Name, input.Slug), ct);
        if (!result.IsSuccess)
            return new VehicleModelPayload(null, [result.Error.Description]);

        return new VehicleModelPayload(
            new VehicleModelDto(result.Value!, input.VehicleMakeId, input.Name, input.Slug), []);
    }

    public async Task<ProductPayload> CreateProductAsync(
        CreateProductGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        if (!Enum.TryParse<PartCondition>(input.Condition, ignoreCase: true, out var condition))
            return new ProductPayload(null, [$"Invalid condition: {input.Condition}"]);

        var translations = input.Translations
            .Select(t => new ProductTranslationInput(t.Locale, t.Name, t.Description))
            .ToList();

        var result = await mediator.Send(new CreateProductCommand(
            input.Sku, input.Slug, input.OemNumber,
            input.BrandId, input.CategoryId, condition,
            (decimal)input.PriceAmount, input.PriceCurrency, input.Stock, translations), ct);

        if (!result.IsSuccess)
            return new ProductPayload(null, [result.Error.Description]);

        var product = await mediator.Send(new GetProductBySlugQuery(input.Slug), ct);
        return new ProductPayload(product.IsSuccess ? product.Value : null, []);
    }

    public async Task<ProductPayload> PublishProductAsync(
        Guid productId,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new PublishProductCommand(productId), ct);
        if (!result.IsSuccess)
            return new ProductPayload(null, [result.Error.Description]);

        var product = await mediator.Send(new GetProductByIdQuery(productId), ct);
        return new ProductPayload(product.IsSuccess ? product.Value : null, []);
    }

    public async Task<ProductPayload> UnpublishProductAsync(
        Guid productId,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UnpublishProductCommand(productId), ct);
        if (!result.IsSuccess)
            return new ProductPayload(null, [result.Error.Description]);

        var product = await mediator.Send(new GetProductByIdQuery(productId), ct);
        return new ProductPayload(product.IsSuccess ? product.Value : null, []);
    }

    public async Task<ProductPayload> UpdateProductStockAsync(
        UpdateProductStockGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateProductStockCommand(input.ProductId, input.NewStock), ct);
        if (!result.IsSuccess)
            return new ProductPayload(null, [result.Error.Description]);

        var product = await mediator.Send(new GetProductByIdQuery(input.ProductId), ct);
        return new ProductPayload(product.IsSuccess ? product.Value : null, []);
    }

    public async Task<ProductPayload> AddProductFitmentAsync(
        AddProductFitmentGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new AddProductFitmentCommand(input.ProductId, input.VehicleModelId, input.YearFrom, input.YearTo), ct);
        if (!result.IsSuccess)
            return new ProductPayload(null, [result.Error.Description]);

        var product = await mediator.Send(new GetProductByIdQuery(input.ProductId), ct);
        return new ProductPayload(product.IsSuccess ? product.Value : null, []);
    }
}

// ── GQL input records (mirror SDL input types) ────────────────────────────────

public sealed record CreateBrandGqlInput(string Name, string Slug, string? LogoUrl);
public sealed record UpdateBrandGqlInput(Guid Id, string Name, string? LogoUrl);
public sealed record CreateCategoryGqlInput(string Name, string Slug, string? IconUrl, int SortOrder, Guid? ParentId);
public sealed record UpdateCategoryGqlInput(Guid Id, string Name, string? ImageUrl, int SortOrder);
public sealed record CreateVehicleMakeGqlInput(string Name, string Slug, string? LogoUrl);
public sealed record CreateVehicleModelGqlInput(string Name, string Slug, Guid VehicleMakeId);
public sealed record ProductTranslationGqlInput(string Locale, string Name, string? Description);
public sealed record CreateProductGqlInput(
    string Sku, string OemNumber, string Slug, string Condition,
    double PriceAmount, string PriceCurrency, int Stock,
    Guid BrandId, Guid CategoryId,
    IReadOnlyList<ProductTranslationGqlInput> Translations);
public sealed record UpdateProductStockGqlInput(Guid ProductId, int NewStock);
public sealed record AddProductFitmentGqlInput(Guid ProductId, Guid VehicleModelId, int YearFrom, int YearTo);

// ── Payload types (returned by mutations) ─────────────────────────────────────

public sealed record BrandPayload(
    PartZone.Catalog.Application.Queries.BrandDto? Brand,
    IReadOnlyList<string> Errors);

public sealed record CategoryPayload(
    PartZone.Catalog.Application.Queries.CategoryDto? Category,
    IReadOnlyList<string> Errors);

public sealed record VehicleMakePayload(
    PartZone.Catalog.Application.Queries.VehicleMakeDto? Make,
    IReadOnlyList<string> Errors);

public sealed record VehicleModelPayload(
    PartZone.Catalog.Application.Queries.VehicleModelDto? Model,
    IReadOnlyList<string> Errors);

public sealed record ProductPayload(
    PartZone.Catalog.Application.Queries.ProductDetailDto? Product,
    IReadOnlyList<string> Errors);
