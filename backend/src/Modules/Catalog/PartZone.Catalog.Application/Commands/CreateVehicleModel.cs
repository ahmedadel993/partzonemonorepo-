using FluentValidation;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Catalog.Domain.Entities;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record CreateVehicleModelCommand(Guid MakeId, string Name, string Slug) : ICommand<Guid>;

public sealed class CreateVehicleModelValidator : AbstractValidator<CreateVehicleModelCommand>
{
    public CreateVehicleModelValidator()
    {
        RuleFor(x => x.MakeId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200).Matches(@"^[a-z0-9-]+$");
    }
}

internal sealed class CreateVehicleModelHandler(ICatalogWriteRepository write)
    : ICommandHandler<CreateVehicleModelCommand, Guid>
{
    public async Task<Result<Guid>> Handle(CreateVehicleModelCommand request, CancellationToken ct)
    {
        var model = VehicleModel.Create(request.MakeId, request.Name, request.Slug);
        write.AddVehicleModel(model);
        await write.SaveChangesAsync(ct);
        return Result.Success(model.Id);
    }
}
