using FluentValidation;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Catalog.Domain.Entities;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record CreateBrandCommand(string Name, string Slug, string? LogoUrl) : ICommand<Guid>;

public sealed class CreateBrandValidator : AbstractValidator<CreateBrandCommand>
{
    public CreateBrandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200).Matches(@"^[a-z0-9-]+$");
    }
}

internal sealed class CreateBrandHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<CreateBrandCommand, Guid>
{
    public async Task<Result<Guid>> Handle(CreateBrandCommand request, CancellationToken ct)
    {
        if (await read.BrandSlugExistsAsync(request.Slug, ct))
            return Result.Failure<Guid>(Error.Conflict("Brand.SlugTaken", $"Slug '{request.Slug}' is already in use."));

        var brand = Brand.Create(request.Name, request.Slug);
        if (request.LogoUrl is not null)
            brand.Update(request.Name, request.LogoUrl);

        write.AddBrand(brand);
        await write.SaveChangesAsync(ct);
        return Result.Success(brand.Id);
    }
}
