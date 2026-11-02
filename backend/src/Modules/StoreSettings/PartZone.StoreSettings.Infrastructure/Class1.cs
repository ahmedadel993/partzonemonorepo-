using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.Extensions.DependencyInjection;
using PartZone.StoreSettings.Application;
using PartZone.StoreSettings.Domain;

namespace PartZone.StoreSettings.Infrastructure;

// ── Repository ────────────────────────────────────────────────────────────────

internal sealed class StoreSettingsRepository : IStoreSettingsRepository
{
    private readonly DbContext _ctx;

    public StoreSettingsRepository(DbContext ctx) => _ctx = ctx;

    public async Task<IReadOnlyList<StoreSetting>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _ctx.Set<StoreSetting>().ToListAsync(ct);
        return list.AsReadOnly();
    }

    public void Add(StoreSetting setting) => _ctx.Set<StoreSetting>().Add(setting);

    public void Update(StoreSetting setting) => _ctx.Set<StoreSetting>().Update(setting);

    public Task SaveChangesAsync(CancellationToken ct = default) => _ctx.SaveChangesAsync(ct);
}

// ── EF Configuration ──────────────────────────────────────────────────────────

internal sealed class StoreSettingConfiguration : IEntityTypeConfiguration<StoreSetting>
{
    public void Configure(EntityTypeBuilder<StoreSetting> builder)
    {
        builder.ToTable("StoreSettings", "settings");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Key).HasMaxLength(100).IsRequired();
        builder.Property(s => s.Value).HasMaxLength(2000).IsRequired();
        builder.HasIndex(s => s.Key).IsUnique();
    }
}

// ── DI ────────────────────────────────────────────────────────────────────────

public static class StoreSettingsInfrastructureExtensions
{
    public static IServiceCollection AddStoreSettingsInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IStoreSettingsRepository, StoreSettingsRepository>();
        return services;
    }
}
