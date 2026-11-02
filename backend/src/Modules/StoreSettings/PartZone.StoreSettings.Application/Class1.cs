using Microsoft.Extensions.DependencyInjection;
using PartZone.Shared.Kernel.Abstractions;
using PartZone.Shared.Kernel.Results;
using PartZone.StoreSettings.Domain;

namespace PartZone.StoreSettings.Application;

// ── Repository interface ──────────────────────────────────────────────────────

public interface IStoreSettingsRepository
{
    Task<IReadOnlyList<StoreSetting>> GetAllAsync(CancellationToken ct = default);
    void Add(StoreSetting setting);
    void Update(StoreSetting setting);
    Task SaveChangesAsync(CancellationToken ct = default);
}

// ── Query ─────────────────────────────────────────────────────────────────────

public sealed record GetStoreSettingsQuery : IQuery<Dictionary<string, string>>;

internal sealed class GetStoreSettingsHandler(IStoreSettingsRepository repo)
    : IQueryHandler<GetStoreSettingsQuery, Dictionary<string, string>>
{
    public async Task<Result<Dictionary<string, string>>> Handle(
        GetStoreSettingsQuery _, CancellationToken ct)
    {
        var settings = await repo.GetAllAsync(ct);
        return Result.Success(settings.ToDictionary(s => s.Key, s => s.Value));
    }
}

// ── Command ───────────────────────────────────────────────────────────────────

public sealed record UpdateStoreSettingsCommand(Dictionary<string, string> Settings) : ICommand;

internal sealed class UpdateStoreSettingsHandler(IStoreSettingsRepository repo)
    : ICommandHandler<UpdateStoreSettingsCommand>
{
    public async Task<Result> Handle(UpdateStoreSettingsCommand request, CancellationToken ct)
    {
        var existing = await repo.GetAllAsync(ct);
        var map = existing.ToDictionary(s => s.Key);

        foreach (var (key, value) in request.Settings)
        {
            if (map.TryGetValue(key, out var setting))
            {
                setting.SetValue(value);
                repo.Update(setting);
            }
            else
            {
                repo.Add(StoreSetting.Create(key, value));
            }
        }

        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}

// ── DI ────────────────────────────────────────────────────────────────────────

public static class StoreSettingsApplicationExtensions
{
    public static IServiceCollection AddStoreSettingsApplication(this IServiceCollection services) =>
        services;
}
