namespace PartZone.Checkout.Domain.ValueObjects;

public sealed class ShippingAddress
{
    private ShippingAddress() { }

    public string FullName { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string AddressLine1 { get; private set; } = string.Empty;
    public string? AddressLine2 { get; private set; }
    public string City { get; private set; } = string.Empty;
    public string Governorate { get; private set; } = string.Empty;
    public string PostalCode { get; private set; } = string.Empty;

    public static ShippingAddress Create(
        string fullName, string phone, string addressLine1, string? addressLine2,
        string city, string governorate, string postalCode)
        => new()
        {
            FullName = fullName,
            Phone = phone,
            AddressLine1 = addressLine1,
            AddressLine2 = addressLine2,
            City = city,
            Governorate = governorate,
            PostalCode = postalCode,
        };
}
