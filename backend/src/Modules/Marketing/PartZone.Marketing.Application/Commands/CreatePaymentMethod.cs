// Phase 6 – Dynamic payment methods
using PartZone.Marketing.Application.Interfaces;
using PartZone.Marketing.Domain.Entities;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Commands;

public sealed record CreatePaymentMethodCommand(
    string Key,
    string LabelAr,
    string LabelEn,
    string? IconUrl,
    bool IsComingSoon,
    int SortOrder) : ICommand<Guid>;

internal sealed class CreatePaymentMethodHandler(IPaymentMethodRepository repo)
    : ICommandHandler<CreatePaymentMethodCommand, Guid>
{
    public async Task<Result<Guid>> Handle(CreatePaymentMethodCommand request, CancellationToken ct)
    {
        var method = PaymentMethod.Create(
            request.Key, request.LabelAr, request.LabelEn,
            request.IconUrl, request.IsComingSoon, request.SortOrder);
        repo.Add(method);
        await repo.SaveChangesAsync(ct);
        return Result.Success(method.Id);
    }
}
