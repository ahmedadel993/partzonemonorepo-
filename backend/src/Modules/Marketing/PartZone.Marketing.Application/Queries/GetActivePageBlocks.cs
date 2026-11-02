using PartZone.Marketing.Application.DTOs;
using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Queries;

public sealed record GetActivePageBlocksQuery : IQuery<IReadOnlyList<ActivePageBlockDto>>;

internal sealed class GetActivePageBlocksHandler(IPageBlockRepository repo)
    : IQueryHandler<GetActivePageBlocksQuery, IReadOnlyList<ActivePageBlockDto>>
{
    public async Task<Result<IReadOnlyList<ActivePageBlockDto>>> Handle(
        GetActivePageBlocksQuery request, CancellationToken ct)
    {
        var blocks = await repo.GetActiveBlocksAsync(ct);
        var dtos = blocks
            .Select(b => new ActivePageBlockDto(
                b.Id,
                b.Type.ToString(),
                b.SortOrder,
                b.Config,
                b.BindingType.ToString(),
                b.TargetId,
                b.TargetUrl,
                b.Translations.Select(t => new PageBlockTranslationDto(
                    t.Locale, t.Title, t.Subtitle, t.CtaText, t.ConfigOverride)).ToList()))
            .ToList();
        return Result.Success<IReadOnlyList<ActivePageBlockDto>>(dtos);
    }
}
