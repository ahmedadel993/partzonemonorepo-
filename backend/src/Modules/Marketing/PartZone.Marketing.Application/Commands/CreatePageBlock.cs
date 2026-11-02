using FluentValidation;
using PartZone.Marketing.Application.Interfaces;
using PartZone.Marketing.Domain.Entities;
using PartZone.Marketing.Domain.Enums;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Commands;

public sealed record PageBlockTranslationInput(
    string Locale,
    string? Title,
    string? Subtitle,
    string? CtaText,
    string? ConfigOverride = null);

public sealed record CreatePageBlockCommand(
    string Type,
    int SortOrder,
    string Config,
    string BindingType,
    Guid? TargetId,
    string? TargetUrl,
    string? ActiveFrom,
    string? ActiveTo,
    IReadOnlyList<PageBlockTranslationInput> Translations) : ICommand<Guid>;

public sealed class CreatePageBlockValidator : AbstractValidator<CreatePageBlockCommand>
{
    public CreatePageBlockValidator()
    {
        RuleFor(x => x.Type).NotEmpty()
            .Must(t => Enum.TryParse<PageBlockType>(t, ignoreCase: true, out _))
            .WithMessage("Invalid block type.");
        RuleFor(x => x.Config).NotEmpty();
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }
}

internal sealed class CreatePageBlockHandler(IPageBlockRepository repo)
    : ICommandHandler<CreatePageBlockCommand, Guid>
{
    public async Task<Result<Guid>> Handle(CreatePageBlockCommand request, CancellationToken ct)
    {
        if (!Enum.TryParse<PageBlockType>(request.Type, ignoreCase: true, out var blockType))
            return Result.Failure<Guid>(Error.Validation("PageBlock.InvalidType", $"Unknown block type: {request.Type}"));

        if (!Enum.TryParse<BindingType>(request.BindingType, ignoreCase: true, out var bindingType))
            bindingType = BindingType.None;

        DateTime? activeFrom = null;
        DateTime? activeTo = null;
        if (request.ActiveFrom is not null && DateTime.TryParse(request.ActiveFrom, out var af)) activeFrom = af.ToUniversalTime();
        if (request.ActiveTo is not null && DateTime.TryParse(request.ActiveTo, out var at)) activeTo = at.ToUniversalTime();

        var block = PageBlock.Create(blockType, request.SortOrder, request.Config,
            bindingType, request.TargetId, request.TargetUrl, activeFrom, activeTo);

        var translations = request.Translations
            .Select(t => PageBlockTranslation.Create(block.Id, t.Locale, t.Title, t.Subtitle, t.CtaText, t.ConfigOverride))
            .ToList();
        block.SetTranslations(translations);

        repo.Add(block);
        await repo.SaveChangesAsync(ct);
        return Result.Success(block.Id);
    }
}
