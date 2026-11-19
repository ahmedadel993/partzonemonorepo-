// Phase 1 – ActivateBrand / DeactivateBrand commands
using PartZone.Catalog.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record ActivateBrandCommand(Guid Id) : ICommand;

internal sealed class ActivateBrandHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<ActivateBrandCommand>
{
    public async Task<Result> Handle(ActivateBrandCommand request, CancellationToken ct)
    {
        var brand = await read.GetBrandByIdAsync(request.Id, ct);
        if (brand is null) return Result.Failure(Error.NotFound("Brand.NotFound", $"Brand {request.Id} not found."));
        brand.Activate();
        write.UpdateBrand(brand);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public sealed record DeactivateBrandCommand(Guid Id) : ICommand;

internal sealed class DeactivateBrandHandler(ICatalogWriteRepository write, ICatalogReadRepository read)
    : ICommandHandler<DeactivateBrandCommand>
{
    public async Task<Result> Handle(DeactivateBrandCommand request, CancellationToken ct)
    {
        var brand = await read.GetBrandByIdAsync(request.Id, ct);
        if (brand is null) return Result.Failure(Error.NotFound("Brand.NotFound", $"Brand {request.Id} not found."));
        brand.Deactivate();
        write.UpdateBrand(brand);
        await write.SaveChangesAsync(ct);
        return Result.Success();
    }
}
