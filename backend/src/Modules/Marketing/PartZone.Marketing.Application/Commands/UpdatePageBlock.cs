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

        // The admin always sends the full schedule; null clears a limit.
        block.UpdateSchedule(ScheduleParsing.ToUtc(request.ActiveFrom), ScheduleParsing.ToUtc(request.ActiveTo));

        if (request.Translations is not null)
        {
            var translations = request.Translations
                .Select(t => PageBlockTranslation.Create(block.Id, t.Locale, t.Title, t.Subtitle, t.CtaText, t.ConfigOverride))
                .ToList();
            // Update in place by locale; only genuinely new locales are inserted.
            // (Replacing all rows made EF send UPDATEs for the new rows, because
            // their Guid keys are set client-side, which failed with 0 rows affected.)
            foreach (var added in block.SyncTranslations(translations))
                repo.AddTranslation(added);
        }

        // The block is tracked (no AsNoTracking), so changes are detected on save.
        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
