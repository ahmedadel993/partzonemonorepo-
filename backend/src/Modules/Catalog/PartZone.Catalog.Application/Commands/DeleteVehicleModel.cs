using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record DeleteVehicleModelCommand(Guid Id) : ICommand;

internal sealed class DeleteVehicleModelHandler(ICatalogReadRepository read, ICatalogWriteRepository write)
    : ICommandHandler<DeleteVehicleModelCommand>
{
    public async Task<Result> Handle(DeleteVehicleModelCommand req, CancellationToken ct)
    {
        var model = await read.GetVehicleModelByIdAsync(req.Id, ct);
        if (model is null) return Result.Failure(Error.NotFound("VehicleModel.NotFound", "الموديل غير موجود"));
        write.RemoveVehicleModel(model);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
