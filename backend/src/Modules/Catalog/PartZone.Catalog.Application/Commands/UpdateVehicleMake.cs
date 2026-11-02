using FluentValidation;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record UpdateVehicleMakeCommand(Guid Id, string Name, string? LogoUrl) : ICommand;

public sealed class UpdateVehicleMakeValidator : AbstractValidator<UpdateVehicleMakeCommand>
{
    public UpdateVehicleMakeValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}

internal sealed class UpdateVehicleMakeHandler(ICatalogReadRepository read, ICatalogWriteRepository write)
    : ICommandHandler<UpdateVehicleMakeCommand>
{
    public async Task<Result> Handle(UpdateVehicleMakeCommand req, CancellationToken ct)
    {
        var make = await read.GetVehicleMakeByIdAsync(req.Id, ct);
        if (make is null) return Result.Failure(Error.NotFound("VehicleMake.NotFound", "الماركة غير موجودة"));
        make.Update(req.Name, req.LogoUrl);
        write.UpdateVehicleMake(make);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
