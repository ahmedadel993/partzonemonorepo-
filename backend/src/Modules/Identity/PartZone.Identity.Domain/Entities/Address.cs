using PartZone.Shared.Kernel.Domain;

namespace PartZone.Identity.Domain.Entities;

public sealed class Address : Entity<Guid>
{
    private Address() : base(Guid.Empty) { }

    public Guid UserId { get; private set; }
    public string Label { get; private set; } = string.Empty;
    public string StreetLine1 { get; private set; } = string.Empty;
    public string? StreetLine2 { get; private set; }
    public string City { get; private set; } = string.Empty;
    public string Governorate { get; private set; } = string.Empty;
    public string PostalCode { get; private set; } = string.Empty;
    public bool IsDefault { get; private set; }

    public static Address Create(
        Guid userId,
        string label,
        string streetLine1,
        string city,
        string governorate,
        string postalCode,
        bool isDefault = false,
        string? streetLine2 = null)
    {
        return new Address
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Label = label,
            StreetLine1 = streetLine1,
            StreetLine2 = streetLine2,
            City = city,
            Governorate = governorate,
            PostalCode = postalCode,
            IsDefault = isDefault,
        };
    }
}
