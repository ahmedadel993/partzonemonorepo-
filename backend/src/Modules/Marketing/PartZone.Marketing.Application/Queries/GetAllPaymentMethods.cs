// Phase 6 – Dynamic payment methods
using PartZone.Marketing.Application.DTOs;
using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Queries;

public sealed record GetAllPaymentMethodsQuery(bool OnlyActive = false) : IQuery<IReadOnlyList<PaymentMethodDto>>;

internal sealed class GetAllPaymentMethodsHandler(IPaymentMethodRepository repo)
    : IQueryHandler<GetAllPaymentMethodsQuery, IReadOnlyList<PaymentMethodDto>>
{
    public async Task<Result<IReadOnlyList<PaymentMethodDto>>> Handle(
        GetAllPaymentMethodsQuery request, CancellationToken ct)
    {
        var methods = request.OnlyActive
            ? await repo.GetActiveAsync(ct)
            : await repo.GetAllAsync(ct);
        return Result.Success<IReadOnlyList<PaymentMethodDto>>(
            methods.OrderBy(m => m.SortOrder)
                   .Select(m => new PaymentMethodDto(
                       m.Id, m.Key, m.LabelAr, m.LabelEn, m.IconUrl, m.IsActive, m.IsComingSoon, m.SortOrder))
                   .ToList());
    }
}
