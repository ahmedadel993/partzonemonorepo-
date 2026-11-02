using PartZone.Marketing.Application.DTOs;
using PartZone.Marketing.Application.Interfaces;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Marketing.Application.Queries;

public sealed record GetPageBlockByIdQuery(Guid Id) : IQuery<PageBlockDto?>;

internal sealed class GetPageBlockByIdHandler(IPageBlockRepository repo)
    : IQueryHandler<GetPageBlockByIdQuery, PageBlockDto?>
{
    public async Task<Result<PageBlockDto?>> Handle(
        GetPageBlockByIdQuery request, CancellationToken ct)
    {
        var block = await repo.GetByIdAsync(request.Id, ct);
        if (block is null) return Result.Success<PageBlockDto?>(null);

        var dto = new PageBlockDto(
            block.Id,
            block.Type.ToString(),
            block.SortOrder,
            block.IsActive,
            block.ActiveFrom?.ToString("O"),
            block.ActiveTo?.ToString("O"),
            block.Config,
            block.BindingType.ToString(),
            block.TargetId,
            block.TargetUrl,
            block.Translations.Select(t => new PageBlockTranslationDto(
                t.Locale, t.Title, t.Subtitle, t.CtaText, t.ConfigOverride)).ToList());
        return Result.Success<PageBlockDto?>(dto);
    }
}
