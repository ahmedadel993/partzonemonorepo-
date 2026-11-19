// Phase 6 – Dynamic payment methods
using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Commands;

public sealed record ActivatePaymentMethodCommand(Guid Id) : ICommand;

internal sealed class ActivatePaymentMethodHandler(IPaymentMethodRepository repo)
    : ICommandHandler<ActivatePaymentMethodCommand>
{
    public async Task<Result> Handle(ActivatePaymentMethodCommand request, CancellationToken ct)
    {
        var method = await repo.GetByIdAsync(request.Id, ct);
        if (method is null) return Result.Failure(Error.NotFound("PaymentMethod.NotFound", $"Payment method {request.Id} not found."));
        method.Activate();
        repo.Update(method);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public sealed record DeactivatePaymentMethodCommand(Guid Id) : ICommand;

internal sealed class DeactivatePaymentMethodHandler(IPaymentMethodRepository repo)
    : ICommandHandler<DeactivatePaymentMethodCommand>
{
    public async Task<Result> Handle(DeactivatePaymentMethodCommand request, CancellationToken ct)
    {
        var method = await repo.GetByIdAsync(request.Id, ct);
        if (method is null) return Result.Failure(Error.NotFound("PaymentMethod.NotFound", $"Payment method {request.Id} not found."));
        method.Deactivate();
        repo.Update(method);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public sealed record DeletePaymentMethodCommand(Guid Id) : ICommand;

internal sealed class DeletePaymentMethodHandler(IPaymentMethodRepository repo)
    : ICommandHandler<DeletePaymentMethodCommand>
{
    public async Task<Result> Handle(DeletePaymentMethodCommand request, CancellationToken ct)
    {
        var method = await repo.GetByIdAsync(request.Id, ct);
        if (method is null) return Result.Failure(Error.NotFound("PaymentMethod.NotFound", $"Payment method {request.Id} not found."));
        repo.Remove(method);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
