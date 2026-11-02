using PartZone.Shared.Kernel.Domain;

namespace PartZone.Identity.Domain.Entities;

public sealed class User : AggregateRoot<Guid>
{
    private User() : base(Guid.Empty) { }

    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string? PhoneNumber { get; private set; }
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyCollection<Address> Addresses => _addresses.AsReadOnly();
    private readonly List<Address> _addresses = [];

    public static User Create(
        string email,
        string passwordHash,
        string firstName,
        string lastName,
        UserRole role = UserRole.Customer)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            FirstName = firstName,
            LastName = lastName,
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };
        return user;
    }

    public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }
    public void Activate()   { IsActive = true;  UpdatedAt = DateTime.UtcNow; }
    public void UpdatePassword(string newHash) { PasswordHash = newHash; UpdatedAt = DateTime.UtcNow; }
    public void ChangeRole(UserRole newRole)  { Role = newRole; UpdatedAt = DateTime.UtcNow; }
}
