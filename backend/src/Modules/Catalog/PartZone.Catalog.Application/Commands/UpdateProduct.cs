using PartZone.Catalog.Application.Interfaces;
using PartZone.Catalog.Domain.Enums;
using PartZone.Catalog.Domain.ValueObjects;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record UpdateProductCommand(
    Guid ProductId,
    string? Slug,
    string? Condition,
    decimal? PriceAmount,
    string? PriceCurrency,
    Guid? BrandId,
    Guid? CategoryId,
    IReadOnlyList<ProductTranslationInput>? Translations) : ICommand;

internal sealed class UpdateProductHandler(
    ICatalogReadRepository read,
    ICatalogWriteRepository write)
    : ICommandHandler<UpdateProductCommand>
{
    public async Task<Result> Handle(UpdateProductCommand req, CancellationToken ct)
    {
        var product = await read.GetProductByIdAsync(req.ProductId, ct);
        if (product is null)
            return Result.Failure(Error.NotFound("Catalog.ProductNotFound", "Product not found."));

        var slug = req.Slug ?? product.Slug;
        var brandId = req.BrandId ?? product.BrandId;
        var categoryId = req.CategoryId ?? product.CategoryId;

        PartCondition condition;
        if (req.Condition is not null)
        {
            if (!Enum.TryParse<PartCondition>(req.Condition, ignoreCase: true, out condition))
                return Result.Failure(Error.Validation("Catalog.InvalidCondition", $"Invalid condition: {req.Condition}"));
        }
        else
        {
            condition = product.Condition;
        }

        var price = req.PriceAmount is not null
            ? Money.Create(req.PriceAmount.Value, req.PriceCurrency ?? product.Price.Currency)
            : product.Price;

        product.Update(slug, brandId, categoryId, condition, price);

        if (req.Translations is not null)
            foreach (var t in req.Translations)
                product.AddTranslation(t.Locale, t.Name, t.Description);

        write.UpdateProduct(product);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
