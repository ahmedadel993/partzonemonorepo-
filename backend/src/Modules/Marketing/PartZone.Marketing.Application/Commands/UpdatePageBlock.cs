using PartZone.Marketing.Application.Interfaces;
using PartZone.Marketing.Domain.Entities;
using PartZone.Marketing.Domain.Enums;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Commands;

public sealed record UpdatePageBlockCommand(
    Guid Id,
    string? Config,
    string? BindingType,
    Guid? TargetId,
    string? TargetUrl,
    string? ActiveFrom,
    string? ActiveTo,
    IReadOnlyList<PageBlockTranslationInput>? Translations) : ICommand;

internal sealed class UpdatePageBlockHandler(IPageBlockRepository repo)
    : ICommandHandler<UpdatePageBlockCommand>
{
    public async Task<Result> Handle(UpdatePageBlockCommand request, CancellationToken ct)
    {
        var block = await repo.GetByIdAsync(request.Id, ct);
        if (block is null)
            return Result.Failure(Error.NotFound("PageBlock.NotFound", $"Page block {request.Id} not found."));

        if (request.Config is not null)
            block.UpdateConfig(request.Config);

        if (request.BindingType is not null)
        {
            Enum.TryParse<BindingType>(request.BindingType, ignoreCase: true, out var bt);
            block.UpdateBinding(bt, request.TargetId, request.TargetUrl);
        }

        if (request.Translations is not null)
        {
            var translations = request.Translations
                .Select(t => PageBlockTranslation.Create(block.Id, t.Locale, t.Title, t.Subtitle, t.CtaText, t.ConfigOverride))
                .ToList();
            block.SetTranslations(translations);
        }

        repo.Update(block);
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
