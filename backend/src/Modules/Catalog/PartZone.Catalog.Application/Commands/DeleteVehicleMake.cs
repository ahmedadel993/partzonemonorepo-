using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record DeleteVehicleMakeCommand(Guid Id) : ICommand;

internal sealed class DeleteVehicleMakeHandler(ICatalogReadRepository read, ICatalogWriteRepository write)
    : ICommandHandler<DeleteVehicleMakeCommand>
{
    public async Task<Result> Handle(DeleteVehicleMakeCommand req, CancellationToken ct)
    {
        var make = await read.GetVehicleMakeByIdAsync(req.Id, ct);
        if (make is null) return Result.Failure(Error.NotFound("VehicleMake.NotFound", "الماركة غير موجودة"));
        write.RemoveVehicleMake(make);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
