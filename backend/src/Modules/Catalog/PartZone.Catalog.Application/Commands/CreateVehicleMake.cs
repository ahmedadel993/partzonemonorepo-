using FluentValidation;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Catalog.Domain.Entities;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Catalog.Application.Commands;

public sealed record CreateVehicleMakeCommand(string Name, string Slug) : ICommand<Guid>;

public sealed class CreateVehicleMakeValidator : AbstractValidator<CreateVehicleMakeCommand>
{
    public CreateVehicleMakeValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200).Matches(@"^[a-z0-9-]+$");
    }
}

internal sealed class CreateVehicleMakeHandler(ICatalogWriteRepository write)
    : ICommandHandler<CreateVehicleMakeCommand, Guid>
{
    public async Task<Result<Guid>> Handle(CreateVehicleMakeCommand request, CancellationToken ct)
    {
        var make = VehicleMake.Create(request.Name, request.Slug);
        write.AddVehicleMake(make);
        await write.SaveChangesAsync(ct);
        return Result.Success(make.Id);
    }
}
