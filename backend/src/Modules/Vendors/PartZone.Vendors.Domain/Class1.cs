using PartZone.Shared.Kernel.Domain;

namespace PartZone.Vendors.Domain;

public enum VendorStatus { Pending = 1, Approved = 2, Suspended = 3 }

public sealed class Vendor : AggregateRoot<Guid>
{
    public Guid UserId { get; private set; }
    public string CompanyName { get; private set; } = default!;
    public string? TaxId { get; private set; }
    public string? PhoneNumber { get; private set; }
    public decimal CommissionRate { get; private set; }
    public VendorStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Vendor() : base(Guid.Empty) { }

    public static Vendor Create(Guid userId, string companyName, string? taxId, string? phoneNumber) =>
        new()
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CompanyName = companyName,
            TaxId = taxId,
            PhoneNumber = phoneNumber,
            CommissionRate = 0.10m,
            Status = VendorStatus.Pending,
            CreatedAt = DateTime.UtcNow,
        };

    public void Approve() => Status = VendorStatus.Approved;
    public void Suspend() => Status = VendorStatus.Suspended;
}
