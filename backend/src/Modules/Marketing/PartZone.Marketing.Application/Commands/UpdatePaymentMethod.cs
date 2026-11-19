// Phase 6 – Dynamic payment methods
using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Commands;

public sealed record UpdatePaymentMethodCommand(
    Guid Id,
    string LabelAr,
    string LabelEn,
    string? IconUrl,
    bool IsComingSoon,
    int SortOrder) : ICommand;

internal sealed class UpdatePaymentMethodHandler(IPaymentMethodRepository repo)
    : ICommandHandler<UpdatePaymentMethodCommand>
{
    public async Task<Result> Handle(UpdatePaymentMethodCommand request, CancellationToken ct)
    {
        var method = await repo.GetByIdAsync(request.Id, ct);
        if (method is null) return Result.Failure(Error.NotFound("PaymentMethod.NotFound", $"Payment method {request.Id} not found."));
        method.Update(request.LabelAr, request.LabelEn, request.IconUrl, request.IsComingSoon, request.SortOrder);
        repo.Update(method);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
