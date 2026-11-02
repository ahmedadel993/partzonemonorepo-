using FluentValidation;
using PartZone.Marketing.Application.Interfaces;
using PartZone.Marketing.Domain.Entities;
using PartZone.Marketing.Domain.Enums;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Commands;

public sealed record CreateCouponCommand(
    string Code,
    string DiscountType,
    decimal Value,
    decimal? MinOrderAmount,
    int UsageLimit,
    int PerUserLimit,
    string ValidFrom,
    string ValidTo) : ICommand<Guid>;

public sealed class CreateCouponValidator : AbstractValidator<CreateCouponCommand>
{
    public CreateCouponValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Value).GreaterThan(0);
        RuleFor(x => x.DiscountType).NotEmpty()
            .Must(t => Enum.TryParse<DiscountType>(t, ignoreCase: true, out _))
            .WithMessage("Invalid discount type.");
    }
}

internal sealed class CreateCouponHandler(ICouponRepository repo)
    : ICommandHandler<CreateCouponCommand, Guid>
{
    public async Task<Result<Guid>> Handle(CreateCouponCommand request, CancellationToken ct)
    {
        var existing = await repo.GetByCodeAsync(request.Code.ToUpperInvariant(), ct);
        if (existing is not null)
            return Result.Failure<Guid>(Error.Conflict("Coupon.CodeTaken", $"Coupon code '{request.Code}' already exists."));

        if (!Enum.TryParse<DiscountType>(request.DiscountType, ignoreCase: true, out var discountType))
            return Result.Failure<Guid>(Error.Validation("Coupon.InvalidType", "Invalid discount type."));

        if (!DateTime.TryParse(request.ValidFrom, out var validFrom) ||
            !DateTime.TryParse(request.ValidTo, out var validTo))
            return Result.Failure<Guid>(Error.Validation("Coupon.InvalidDates", "Invalid date format."));

        var coupon = Coupon.Create(
            request.Code, discountType, request.Value, request.MinOrderAmount,
            request.UsageLimit, request.PerUserLimit,
            validFrom.ToUniversalTime(), validTo.ToUniversalTime());

        repo.Add(coupon);
        await repo.SaveChangesAsync(ct);
        return Result.Success(coupon.Id);
    }
}
