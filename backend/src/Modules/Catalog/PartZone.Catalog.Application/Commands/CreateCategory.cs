using FluentValidation;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Catalog.Domain.Entities;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record CreateCategoryCommand(string Name, string Slug, Guid? ParentId = null, int SortOrder = 0) : ICommand<Guid>;

public sealed class CreateCategoryValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200).Matches(@"^[a-z0-9-]+$");
    }
}

internal sealed class CreateCategoryHandler(ICatalogWriteRepository write)
    : ICommandHandler<CreateCategoryCommand, Guid>
{
    public async Task<Result<Guid>> Handle(CreateCategoryCommand request, CancellationToken ct)
    {
        var category = Category.Create(request.Name, request.Slug, request.ParentId, request.SortOrder);
        write.AddCategory(category);
        await write.SaveChangesAsync(ct);
        return Result.Success(category.Id);
    }
}
