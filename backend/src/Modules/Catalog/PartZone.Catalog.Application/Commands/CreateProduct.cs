using FluentValidation;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Catalog.Domain.Entities;
using PartZone.Catalog.Domain.Enums;
using PartZone.Catalog.Domain.ValueObjects;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record ProductTranslationInput(string Locale, string Name, string? Description);

public sealed record CreateProductCommand(
    string SKU,
    string Slug,
    string OemNumber,
    Guid BrandId,
    Guid CategoryId,
    PartCondition Condition,
    decimal PriceAmount,
    string PriceCurrency,
    int Stock,
    IReadOnlyList<ProductTranslationInput> Translations) : ICommand<Guid>;

public sealed class CreateProductValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.SKU).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(300).Matches(@"^[a-z0-9-]+$");
        RuleFor(x => x.BrandId).NotEmpty();
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.PriceAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Translations).NotEmpty();
    }
}

internal sealed class CreateProductHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<CreateProductCommand, Guid>
{
    public async Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken ct)
    {
        if (await read.ProductSkuExistsAsync(request.SKU, ct))
            return Result.Failure<Guid>(Error.Conflict("Product.SkuTaken", $"SKU '{request.SKU}' already exists."));

        if (await read.ProductSlugExistsAsync(request.Slug, ct))
            return Result.Failure<Guid>(Error.Conflict("Product.SlugTaken", $"Slug '{request.Slug}' already exists."));

        var price = Money.Create(request.PriceAmount, request.PriceCurrency);
        var product = Product.Create(request.SKU, request.Slug, request.OemNumber,
            request.BrandId, request.CategoryId, request.Condition, price, request.Stock);

        foreach (var t in request.Translations)
            product.AddTranslation(t.Locale, t.Name, t.Description);

        write.AddProduct(product);
        await write.SaveChangesAsync(ct);
        return Result.Success(product.Id);
    }
}
