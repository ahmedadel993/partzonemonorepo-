using PartZone.Shared.Kernel.Domain;

namespace PartZone.StoreSettings.Domain;

public sealed class StoreSetting : Entity<Guid>
{
    public string Key { get; private set; } = default!;
    public string Value { get; private set; } = default!;
    public DateTime UpdatedAt { get; private set; }

    private StoreSetting() : base(Guid.Empty) { }

    public static StoreSetting Create(string key, string value) =>
        new() { Id = Guid.NewGuid(), Key = key, Value = value, UpdatedAt = DateTime.UtcNow };

    public void SetValue(string value)
    {
        Value = value;
        UpdatedAt = DateTime.UtcNow;
    }
}
