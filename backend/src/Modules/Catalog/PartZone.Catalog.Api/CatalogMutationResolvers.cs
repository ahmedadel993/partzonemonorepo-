using MediatR;
using PartZone.Catalog.Application.Commands;
using PartZone.Catalog.Application.Queries;
using PartZone.Catalog.Domain.Enums;

namespace PartZone.Catalog.Api;

[ExtendObjectType("Mutation")]
public sealed class CatalogMutationResolvers
{
    public async Task<BrandPayloadDto> CreateBrandAsync(
        CreateBrandGqlInput input,
        [Service] IMediator mediator,
        [Service] ISender sender,
        CancellationToken ct)
    {
        var result = await mediator.Send(new CreateBrandCommand(input.Name, input.Slug, input.LogoUrl), ct);
        if (!result.IsSuccess)
            return new BrandPayloadDto(null, [result.Error.Description]);

        var brand = await mediator.Send(new GetBrandBySlugQuery(input.Slug), ct);
        return new BrandPayloadDto(brand.IsSuccess ? brand.Value : null, []);
    }

    public async Task<BrandPayloadDto> UpdateBrandAsync(
        UpdateBrandGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateBrandCommand(
            input.Id, input.Name, input.LogoUrl,
            input.IsFeatured, input.ShowInHome, input.IsSponsored), ct);
        if (!result.IsSuccess)
            return new BrandPayloadDto(null, [result.Error.Description]);

        var brand = await mediator.Send(new GetBrandByIdQuery(input.Id), ct);
        return new BrandPayloadDto(brand.IsSuccess ? brand.Value : null, []);
    }

    // Phase 3 – activateBrand / deactivateBrand mutations
    public async Task<BrandPayloadDto> ActivateBrandAsync(
        Guid brandId, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new ActivateBrandCommand(brandId), ct);
        if (!result.IsSuccess) return new BrandPayloadDto(null, [result.Error.Description]);
        var brand = await mediator.Send(new GetBrandByIdQuery(brandId), ct);
        return new BrandPayloadDto(brand.IsSuccess ? brand.Value : null, []);
    }

    public async Task<BrandPayloadDto> DeactivateBrandAsync(
        Guid brandId, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new DeactivateBrandCommand(brandId), ct);
        if (!result.IsSuccess) return new BrandPayloadDto(null, [result.Error.Description]);
        var brand = await mediator.Send(new GetBrandByIdQuery(brandId), ct);
        return new BrandPayloadDto(brand.IsSuccess ? brand.Value : null, []);
    }

    public async Task<CategoryPayloadDto> CreateCategoryAsync(
        CreateCategoryGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new CreateCategoryCommand(input.Name, input.Slug, input.ParentId, input.SortOrder), ct);
        if (!result.IsSuccess)
            return new CategoryPayloadDto(null, [result.Error.Description]);

        var category = await mediator.Send(new GetCategoryBySlugQuery(input.Slug), ct);
        return new CategoryPayloadDto(category.IsSuccess ? category.Value : null, []);
    }

    public async Task<CategoryPayloadDto> UpdateCategoryAsync(
        UpdateCategoryGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        // Phase 8 – Bug fix: re-query after save (was returning null category on success)
        var result = await mediator.Send(
            new UpdateCategoryCommand(input.Id, input.Name, input.ImageUrl, input.SortOrder,
                input.IsActive, input.IsFeatured, input.ShowInHome, input.ShowInMenu), ct);
        if (!result.IsSuccess)
            return new CategoryPayloadDto(null, [result.Error.Description]);

        var category = await mediator.Send(new GetCategoryByIdQuery(input.Id), ct);
        return new CategoryPayloadDto(category.IsSuccess ? category.Value : null, []);
    }

    public async Task<DeletePayloadDto> DeleteBrandAsync(
        Guid id,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteBrandCommand(id), ct);
        return result.IsSuccess ? new DeletePayloadDto([]) : new DeletePayloadDto([result.Error.Description]);
    }

    public async Task<CategoryPayloadDto> ActivateCategoryAsync(
        Guid id, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new ActivateCategoryCommand(id), ct);
        if (!result.IsSuccess) return new CategoryPayloadDto(null, [result.Error.Description]);
        var category = await mediator.Send(new GetCategoryByIdQuery(id), ct);
        return new CategoryPayloadDto(category.IsSuccess ? category.Value : null, []);
    }

    public async Task<CategoryPayloadDto> DeactivateCategoryAsync(
        Guid id, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new DeactivateCategoryCommand(id), ct);
        if (!result.IsSuccess) return new CategoryPayloadDto(null, [result.Error.Description]);
        var category = await mediator.Send(new GetCategoryByIdQuery(id), ct);
        return new CategoryPayloadDto(category.IsSuccess ? category.Value : null, []);
    }

    public async Task<DeletePayloadDto> DeleteCategoryAsync(
        Guid id,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteCategoryCommand(id), ct);
        return result.IsSuccess ? new DeletePayloadDto([]) : new DeletePayloadDto([result.Error.Description]);
    }

    public async Task<DeletePayloadDto> DeleteProductAsync(
        Guid id,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteProductCommand(id), ct);
        return result.IsSuccess ? new DeletePayloadDto([]) : new DeletePayloadDto([result.Error.Description]);
    }

    public async Task<VehicleMakePayloadDto> CreateVehicleMakeAsync(
        CreateVehicleMakeGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateVehicleMakeCommand(input.Name, input.Slug), ct);
        if (!result.IsSuccess)
            return new VehicleMakePayloadDto(null, [result.Error.Description]);

        return new VehicleMakePayloadDto(
            new VehicleMakeDto(result.Value!, input.Name, input.Slug, input.LogoUrl), []);
    }

    public async Task<VehicleMakePayloadDto> UpdateVehicleMakeAsync(
        UpdateVehicleMakeGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateVehicleMakeCommand(input.Id, input.Name, input.LogoUrl), ct);
        return result.IsSuccess
            ? new VehicleMakePayloadDto(null, [])
            : new VehicleMakePayloadDto(null, [result.Error.Description]);
    }

    public async Task<DeletePayloadDto> DeleteVehicleMakeAsync(
        Guid id,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteVehicleMakeCommand(id), ct);
        return result.IsSuccess ? new DeletePayloadDto([]) : new DeletePayloadDto([result.Error.Description]);
    }

    public async Task<VehicleModelPayloadDto> CreateVehicleModelAsync(
        CreateVehicleModelGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new CreateVehicleModelCommand(input.VehicleMakeId, input.Name, input.Slug), ct);
        if (!result.IsSuccess)
            return new VehicleModelPayloadDto(null, [result.Error.Description]);

        return new VehicleModelPayloadDto(
            new VehicleModelDto(result.Value!, input.VehicleMakeId, input.Name, input.Slug), []);
    }

    public async Task<VehicleModelPayloadDto> UpdateVehicleModelAsync(
        UpdateVehicleModelGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateVehicleModelCommand(input.Id, input.Name), ct);
        return result.IsSuccess
            ? new VehicleModelPayloadDto(null, [])
            : new VehicleModelPayloadDto(null, [result.Error.Description]);
    }

    public async Task<DeletePayloadDto> DeleteVehicleModelAsync(
        Guid id,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteVehicleModelCommand(id), ct);
        return result.IsSuccess ? new DeletePayloadDto([]) : new DeletePayloadDto([result.Error.Description]);
    }

    public async Task<ProductPayloadDto> CreateProductAsync(
        CreateProductGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        if (!Enum.TryParse<PartCondition>(input.Condition, ignoreCase: true, out var condition))
            return new ProductPayloadDto(null, [$"Invalid condition: {input.Condition}"]);

        var translations = input.Translations
            .Select(t => new ProductTranslationInput(t.Locale, t.Name, t.Description))
            .ToList();

        var result = await mediator.Send(new CreateProductCommand(
            input.Sku, input.Slug, input.OemNumber,
            input.BrandId, input.CategoryId, condition,
            (decimal)input.PriceAmount, input.PriceCurrency, input.Stock, translations), ct);

        if (!result.IsSuccess)
            return new ProductPayloadDto(null, [result.Error.Description]);

        var product = await mediator.Send(new GetProductBySlugQuery(input.Slug), ct);
        return new ProductPayloadDto(product.IsSuccess ? product.Value : null, []);
    }

    public async Task<ProductPayloadDto> PublishProductAsync(
        Guid productId,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new PublishProductCommand(productId), ct);
        if (!result.IsSuccess)
            return new ProductPayloadDto(null, [result.Error.Description]);

        var product = await mediator.Send(new GetProductByIdQuery(productId), ct);
        return new ProductPayloadDto(product.IsSuccess ? product.Value : null, []);
    }

    public async Task<ProductPayloadDto> UnpublishProductAsync(
        Guid productId,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UnpublishProductCommand(productId), ct);
        if (!result.IsSuccess)
            return new ProductPayloadDto(null, [result.Error.Description]);

        var product = await mediator.Send(new GetProductByIdQuery(productId), ct);
        return new ProductPayloadDto(product.IsSuccess ? product.Value : null, []);
    }

    public async Task<ProductPayloadDto> UpdateProductStockAsync(
        UpdateProductStockGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateProductStockCommand(input.ProductId, input.NewStock), ct);
        if (!result.IsSuccess)
            return new ProductPayloadDto(null, [result.Error.Description]);

        var product = await mediator.Send(new GetProductByIdQuery(input.ProductId), ct);
        return new ProductPayloadDto(product.IsSuccess ? product.Value : null, []);
    }

    public async Task<ProductPayloadDto> AddProductFitmentAsync(
        AddProductFitmentGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new AddProductFitmentCommand(input.ProductId, input.VehicleModelId, input.YearFrom, input.YearTo), ct);
        if (!result.IsSuccess)
            return new ProductPayloadDto(null, [result.Error.Description]);

        var product = await mediator.Send(new GetProductByIdQuery(input.ProductId), ct);
        return new ProductPayloadDto(product.IsSuccess ? product.Value : null, []);
    }

    public async Task<ProductPayloadDto> AddProductImageAsync(
        AddProductImageGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(
            new AddProductImageCommand(input.ProductId, input.Url, input.AltText, input.IsPrimary ?? false), ct);
        return await ProductPayloadAsync(result, input.ProductId, mediator, ct);
    }

    public async Task<ProductPayloadDto> RemoveProductImageAsync(
        Guid productId, Guid imageId,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new RemoveProductImageCommand(productId, imageId), ct);
        return await ProductPayloadAsync(result, productId, mediator, ct);
    }

    public async Task<ProductPayloadDto> SetPrimaryProductImageAsync(
        Guid productId, Guid imageId,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new SetPrimaryProductImageCommand(productId, imageId), ct);
        return await ProductPayloadAsync(result, productId, mediator, ct);
    }

    private static async Task<ProductPayloadDto> ProductPayloadAsync(
        PartZone.Shared.Kernel.Results.Result result, Guid productId, IMediator mediator, CancellationToken ct)
    {
        if (!result.IsSuccess)
            return new ProductPayloadDto(null, [result.Error.Description]);

        var product = await mediator.Send(new GetProductByIdQuery(productId), ct);
        return new ProductPayloadDto(product.IsSuccess ? product.Value : null, []);
    }

    public async Task<ProductPayloadDto> UpdateProductAsync(
        UpdateProductGqlInput input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var translations = input.Translations?.Select(t =>
            new ProductTranslationInput(t.Locale, t.Name, t.Description)).ToList();

        var result = await mediator.Send(new UpdateProductCommand(
            input.ProductId,
            input.Slug,
            input.Condition,
            (decimal?)input.PriceAmount,
            input.PriceCurrency,
            input.BrandId,
            input.CategoryId,
            translations,
            input.IsFeatured,
            input.IsBestSeller,
            input.IsNew,
            input.IsOnSale), ct);

        if (!result.IsSuccess)
            return new ProductPayloadDto(null, [result.Error.Description]);

        var product = await mediator.Send(new GetProductByIdQuery(input.ProductId), ct);
        return new ProductPayloadDto(product.IsSuccess ? product.Value : null, []);
    }
}

// ── GQL input records (mirror SDL input types) ────────────────────────────────

public sealed record CreateBrandGqlInput(string Name, string Slug, string? LogoUrl);
// Phase 3 – added display flag fields to GQL input records
public sealed record UpdateBrandGqlInput(Guid Id, string Name, string? LogoUrl,
    bool? IsFeatured = null, bool? ShowInHome = null, bool? IsSponsored = null);
public sealed record CreateCategoryGqlInput(string Name, string Slug, string? IconUrl, int SortOrder, Guid? ParentId);
public sealed record UpdateCategoryGqlInput(Guid Id, string Name, string? ImageUrl, int SortOrder,
    bool? IsActive = null, bool? IsFeatured = null, bool? ShowInHome = null, bool? ShowInMenu = null);
public sealed record CreateVehicleMakeGqlInput(string Name, string Slug, string? LogoUrl);
public sealed record UpdateVehicleMakeGqlInput(Guid Id, string Name, string? LogoUrl);
public sealed record CreateVehicleModelGqlInput(string Name, string Slug, Guid VehicleMakeId);
public sealed record UpdateVehicleModelGqlInput(Guid Id, string Name);
public sealed record ProductTranslationGqlInput(string Locale, string Name, string? Description);
public sealed record CreateProductGqlInput(
    string Sku, string OemNumber, string Slug, string Condition,
    double PriceAmount, string PriceCurrency, int Stock,
    Guid BrandId, Guid CategoryId,
    IReadOnlyList<ProductTranslationGqlInput> Translations);
public sealed record UpdateProductStockGqlInput(Guid ProductId, int NewStock);
public sealed record AddProductImageGqlInput(Guid ProductId, string Url, string? AltText, bool? IsPrimary);
public sealed record AddProductFitmentGqlInput(Guid ProductId, Guid VehicleModelId, int YearFrom, int YearTo);
public sealed record UpdateProductGqlInput(
    Guid ProductId,
    string? Slug,
    string? Condition,
    double? PriceAmount,
    string? PriceCurrency,
    Guid? BrandId,
    Guid? CategoryId,
    IReadOnlyList<ProductTranslationGqlInput>? Translations,
    bool? IsFeatured = null,
    bool? IsBestSeller = null,
    bool? IsNew = null,
    bool? IsOnSale = null);

// ── Payload types (returned by mutations) ─────────────────────────────────────

public sealed record BrandPayloadDto(
    PartZone.Catalog.Application.Queries.BrandDto? Brand,
    IReadOnlyList<string> Errors);

public sealed record CategoryPayloadDto(
    PartZone.Catalog.Application.Queries.CategoryDto? Category,
    IReadOnlyList<string> Errors);

public sealed record VehicleMakePayloadDto(
    PartZone.Catalog.Application.Queries.VehicleMakeDto? Make,
    IReadOnlyList<string> Errors);

public sealed record VehicleModelPayloadDto(
    PartZone.Catalog.Application.Queries.VehicleModelDto? Model,
    IReadOnlyList<string> Errors);

public sealed record DeletePayloadDto(IReadOnlyList<string> Errors);

public sealed record ProductPayloadDto(
    PartZone.Catalog.Application.Queries.ProductDetailDto? Product,
    IReadOnlyList<string> Errors);
