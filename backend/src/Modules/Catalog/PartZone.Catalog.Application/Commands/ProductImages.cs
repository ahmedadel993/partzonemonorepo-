using FluentValidation;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

// ── Add ───────────────────────────────────────────────────────────────────────

public sealed record AddProductImageCommand(Guid ProductId, string Url, string? AltText, bool IsPrimary) : ICommand;

public sealed class AddProductImageValidator : AbstractValidator<AddProductImageCommand>
{
    public AddProductImageValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Url).NotEmpty().MaximumLength(1000)
            .Must(u => Uri.TryCreate(u, UriKind.Absolute, out var uri)
                       && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            .WithMessage("Image URL must be an absolute http(s) URL.");
        RuleFor(x => x.AltText).MaximumLength(300);
    }
}

internal sealed class AddProductImageHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<AddProductImageCommand>
{
    public async Task<Result> Handle(AddProductImageCommand request, CancellationToken ct)
    {
        var product = await read.GetProductByIdAsync(request.ProductId, ct);
        if (product is null)
            return Result.Failure(Error.NotFound("Product.NotFound", $"Product {request.ProductId} not found."));

        product.AddImage(request.Url, request.AltText ?? string.Empty, request.IsPrimary);
        write.UpdateProduct(product);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}

// ── Remove ────────────────────────────────────────────────────────────────────

public sealed record RemoveProductImageCommand(Guid ProductId, Guid ImageId) : ICommand;

internal sealed class RemoveProductImageHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<RemoveProductImageCommand>
{
    public async Task<Result> Handle(RemoveProductImageCommand request, CancellationToken ct)
    {
        var product = await read.GetProductByIdAsync(request.ProductId, ct);
        if (product is null)
            return Result.Failure(Error.NotFound("Product.NotFound", $"Product {request.ProductId} not found."));

        var removed = product.RemoveImage(request.ImageId);
        if (removed is null)
            return Result.Failure(Error.NotFound("ProductImage.NotFound", $"Image {request.ImageId} not found."));

        write.UpdateProduct(product);
        write.RemoveProductImage(removed);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}

// ── Set primary ───────────────────────────────────────────────────────────────

public sealed record SetPrimaryProductImageCommand(Guid ProductId, Guid ImageId) : ICommand;

internal sealed class SetPrimaryProductImageHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<SetPrimaryProductImageCommand>
{
    public async Task<Result> Handle(SetPrimaryProductImageCommand request, CancellationToken ct)
    {
        var product = await read.GetProductByIdAsync(request.ProductId, ct);
        if (product is null)
            return Result.Failure(Error.NotFound("Product.NotFound", $"Product {request.ProductId} not found."));

        if (!product.SetPrimaryImage(request.ImageId))
            return Result.Failure(Error.NotFound("ProductImage.NotFound", $"Image {request.ImageId} not found."));

        write.UpdateProduct(product);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
