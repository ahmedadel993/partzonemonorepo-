using FluentValidation;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

// Phase 1 – Added IsFeatured, ShowInHome, IsSponsored flags
public sealed record UpdateBrandCommand(
    Guid Id,
    string Name,
    string? LogoUrl,
    bool? IsFeatured = null,
    bool? ShowInHome = null,
    bool? IsSponsored = null) : ICommand;

public sealed class UpdateBrandValidator : AbstractValidator<UpdateBrandCommand>
{
    public UpdateBrandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}

internal sealed class UpdateBrandHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<UpdateBrandCommand>
{
    public async Task<Result> Handle(UpdateBrandCommand request, CancellationToken ct)
    {
        var brand = await read.GetBrandByIdAsync(request.Id, ct);
        if (brand is null) return Result.Failure(Error.NotFound("Brand.NotFound", $"Brand {request.Id} not found."));

        brand.Update(
            request.Name,
            request.LogoUrl,
            request.IsFeatured  ?? brand.IsFeatured,
            request.ShowInHome  ?? brand.ShowInHome,
            request.IsSponsored ?? brand.IsSponsored);
        write.UpdateBrand(brand);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
