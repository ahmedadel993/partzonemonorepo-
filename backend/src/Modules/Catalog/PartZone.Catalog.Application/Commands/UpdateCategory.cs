using FluentValidation;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record UpdateCategoryCommand(Guid Id, string Name, string? ImageUrl, int SortOrder) : ICommand;

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

        category.Update(request.Name, request.ImageUrl, request.SortOrder);
        write.UpdateCategory(category);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
