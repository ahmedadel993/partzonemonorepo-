using FluentValidation;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record UpdateVehicleModelCommand(Guid Id, string Name) : ICommand;

public sealed class UpdateVehicleModelValidator : AbstractValidator<UpdateVehicleModelCommand>
{
    public UpdateVehicleModelValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}

internal sealed class UpdateVehicleModelHandler(ICatalogReadRepository read, ICatalogWriteRepository write)
    : ICommandHandler<UpdateVehicleModelCommand>
{
    public async Task<Result> Handle(UpdateVehicleModelCommand req, CancellationToken ct)
    {
        var model = await read.GetVehicleModelByIdAsync(req.Id, ct);
        if (model is null) return Result.Failure(Error.NotFound("VehicleModel.NotFound", "الموديل غير موجود"));
        model.Update(req.Name);
        write.UpdateVehicleModel(model);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
