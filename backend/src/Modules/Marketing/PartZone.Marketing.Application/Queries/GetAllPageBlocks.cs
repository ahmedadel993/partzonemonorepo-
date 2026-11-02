using PartZone.Marketing.Application.DTOs;
using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Queries;

public sealed record GetAllPageBlocksQuery : IQuery<IReadOnlyList<PageBlockDto>>;

internal sealed class GetAllPageBlocksHandler(IPageBlockRepository repo)
    : IQueryHandler<GetAllPageBlocksQuery, IReadOnlyList<PageBlockDto>>
{
    public async Task<Result<IReadOnlyList<PageBlockDto>>> Handle(
        GetAllPageBlocksQuery request, CancellationToken ct)
    {
        var blocks = await repo.GetAllBlocksAsync(ct);
        var dtos = blocks
            .Select(b => new PageBlockDto(
                b.Id,
                b.Type.ToString(),
                b.SortOrder,
                b.IsActive,
                b.ActiveFrom?.ToString("O"),
                b.ActiveTo?.ToString("O"),
                b.Config,
                b.BindingType.ToString(),
                b.TargetId,
                b.TargetUrl,
                b.Translations.Select(t => new PageBlockTranslationDto(
                    t.Locale, t.Title, t.Subtitle, t.CtaText, t.ConfigOverride)).ToList()))
            .ToList();
        return Result.Success<IReadOnlyList<PageBlockDto>>(dtos);
    }
}
