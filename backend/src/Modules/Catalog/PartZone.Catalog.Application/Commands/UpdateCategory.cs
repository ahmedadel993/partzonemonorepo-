using FluentValidation;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

// Phase 1 – Added IsActive, IsFeatured, ShowInHome, ShowInMenu flags
public sealed record UpdateCategoryCommand(
    Guid Id,
    string Name,
    string? ImageUrl,
    int SortOrder,
    bool? IsActive = null,
    bool? IsFeatured = null,
    bool? ShowInHome = null,
    bool? ShowInMenu = null) : ICommand;

public sealed class UpdateCategoryValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }
}

internal sealed class UpdateCategoryHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<UpdateCategoryCommand>
{
    public async Task<Result> Handle(UpdateCategoryCommand request, CancellationToken ct)
    {
        var category = await read.GetCategoryByIdAsync(request.Id, ct);
        if (category is null)
            return Result.Failure(Error.NotFound("Catalog.CategoryNotFound", $"Category {request.Id} not found."));

        category.Update(
            request.Name,
            request.ImageUrl,
            request.SortOrder,
            request.IsActive   ?? category.IsActive,
            request.IsFeatured ?? category.IsFeatured,
            request.ShowInHome ?? category.ShowInHome,
            request.ShowInMenu ?? category.ShowInMenu);
        write.UpdateCategory(category);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
