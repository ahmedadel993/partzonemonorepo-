using MediatR;
using PartZone.Marketing.Application.Commands;
using PartZone.Marketing.Application.DTOs;
using PartZone.Marketing.Application.Queries;

namespace PartZone.Marketing.Api;

[ExtendObjectType("Mutation")]
public sealed class MarketingMutationResolvers
{
    public async Task<PageBlockPayloadDto> CreatePageBlockAsync(
        CreatePageBlockInputGql input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var translations = input.Translations
            .Select(t => new PageBlockTranslationInput(t.Locale, t.Title, t.Subtitle, t.CtaText, t.ConfigOverride))
            .ToList();
        var result = await mediator.Send(new CreatePageBlockCommand(
            input.Type, input.SortOrder, input.Config, input.BindingType,
            input.TargetId, input.TargetUrl, input.ActiveFrom, input.ActiveTo, translations), ct);
        if (!result.IsSuccess) return new PageBlockPayloadDto(null, [result.Error.Description]);

        var blockResult = await mediator.Send(new GetPageBlockByIdQuery(result.Value!), ct);
        return new PageBlockPayloadDto(blockResult.Value, []);
    }

    public async Task<PageBlockPayloadDto> UpdatePageBlockAsync(
        UpdatePageBlockInputGql input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var translations = input.Translations?
            .Select(t => new PageBlockTranslationInput(t.Locale, t.Title, t.Subtitle, t.CtaText, t.ConfigOverride))
            .ToList();
        var result = await mediator.Send(new UpdatePageBlockCommand(
            input.Id, input.Config, input.BindingType, input.TargetId,
            input.TargetUrl, input.ActiveFrom, input.ActiveTo, translations), ct);
        if (!result.IsSuccess) return new PageBlockPayloadDto(null, [result.Error.Description]);

        var blockResult = await mediator.Send(new GetPageBlockByIdQuery(input.Id), ct);
        return new PageBlockPayloadDto(blockResult.Value, []);
    }

    public async Task<PageBlockPayloadDto> ActivatePageBlockAsync(
        Guid id, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new ActivatePageBlockCommand(id), ct);
        if (!result.IsSuccess) return new PageBlockPayloadDto(null, [result.Error.Description]);
        var blockResult = await mediator.Send(new GetPageBlockByIdQuery(id), ct);
        return new PageBlockPayloadDto(blockResult.Value, []);
    }

    public async Task<PageBlockPayloadDto> DeactivatePageBlockAsync(
        Guid id, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new DeactivatePageBlockCommand(id), ct);
        if (!result.IsSuccess) return new PageBlockPayloadDto(null, [result.Error.Description]);
        var blockResult = await mediator.Send(new GetPageBlockByIdQuery(id), ct);
        return new PageBlockPayloadDto(blockResult.Value, []);
    }

    public async Task<IReadOnlyList<PageBlockDto>> ReorderPageBlocksAsync(
        IReadOnlyList<ReorderItemInputGql> input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var items = input.Select(i => new ReorderItem(i.Id, i.SortOrder)).ToList();
        await mediator.Send(new ReorderPageBlocksCommand(items), ct);
        var result = await mediator.Send(new GetAllPageBlocksQuery(), ct);
        return result.IsSuccess ? result.Value! : [];
    }

    public async Task<CouponPayloadDto> CreateCouponAsync(
        CreateCouponInputGql input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateCouponCommand(
            input.Code, input.DiscountType, (decimal)input.Value, input.MinOrderAmount.HasValue ? (decimal?)input.MinOrderAmount.Value : null,
            input.UsageLimit, input.PerUserLimit, input.ValidFrom, input.ValidTo), ct);
        if (!result.IsSuccess) return new CouponPayloadDto(null, [result.Error.Description]);
        var allResult = await mediator.Send(new GetAllCouponsQuery(), ct);
        var dto = allResult.Value!.FirstOrDefault(c => c.Id == result.Value!);
        return new CouponPayloadDto(dto, []);
    }

    public async Task<CouponPayloadDto> UpdateCouponAsync(
        UpdateCouponInputGql input,
        [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateCouponCommand(
            input.Id, input.DiscountType,
            input.Value.HasValue ? (decimal?)input.Value.Value : null,
            input.MinOrderAmount.HasValue ? (decimal?)input.MinOrderAmount.Value : null,
            input.UsageLimit, input.PerUserLimit,
            input.ValidFrom, input.ValidTo, input.IsActive), ct);
        if (!result.IsSuccess) return new CouponPayloadDto(null, [result.Error.Description]);
        var allResult = await mediator.Send(new GetAllCouponsQuery(), ct);
        var dto = allResult.Value!.FirstOrDefault(c => c.Id == input.Id);
        return new CouponPayloadDto(dto, []);
    }

    public async Task<CouponPayloadDto> DeactivateCouponAsync(
        Guid id, [Service] IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new DeactivateCouponCommand(id), ct);
        if (!result.IsSuccess) return new CouponPayloadDto(null, [result.Error.Description]);
        var allResult = await mediator.Send(new GetAllCouponsQuery(), ct);
        var dto = allResult.Value!.FirstOrDefault(c => c.Id == id);
        return new CouponPayloadDto(dto, []);
    }
}

// ── GQL input records ─────────────────────────────────────────────────────────

public sealed record PageBlockTranslationInputGql(
    string Locale,
    string? Title,
    string? Subtitle,
    string? CtaText,
    string? ConfigOverride);

public sealed record CreatePageBlockInputGql(
    string Type,
    int SortOrder,
    string Config,
    string BindingType,
    Guid? TargetId,
    string? TargetUrl,
    string? ActiveFrom,
    string? ActiveTo,
    IReadOnlyList<PageBlockTranslationInputGql> Translations);

public sealed record UpdatePageBlockInputGql(
    Guid Id,
    string? Config,
    string? BindingType,
    Guid? TargetId,
    string? TargetUrl,
    string? ActiveFrom,
    string? ActiveTo,
    IReadOnlyList<PageBlockTranslationInputGql>? Translations);

public sealed record ReorderItemInputGql(Guid Id, int SortOrder);

public sealed record CreateCouponInputGql(
    string Code,
    string DiscountType,
    float Value,
    float? MinOrderAmount,
    int UsageLimit,
    int PerUserLimit,
    string ValidFrom,
    string ValidTo);

public sealed record UpdateCouponInputGql(
    Guid Id,
    string? DiscountType,
    float? Value,
    float? MinOrderAmount,
    int? UsageLimit,
    int? PerUserLimit,
    string? ValidFrom,
    string? ValidTo,
    bool? IsActive);

// ── GQL payload records ───────────────────────────────────────────────────────

public sealed record PageBlockPayloadDto(PageBlockDto? PageBlock, IReadOnlyList<string> Errors);
public sealed record CouponPayloadDto(CouponDto? Coupon, IReadOnlyList<string> Errors);
