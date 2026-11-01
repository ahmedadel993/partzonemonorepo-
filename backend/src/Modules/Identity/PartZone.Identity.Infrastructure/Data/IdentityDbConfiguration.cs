using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Identity.Domain.Entities;

namespace PartZone.Identity.Infrastructure.Data;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users", "identity");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Email).HasMaxLength(255).IsRequired();
        builder.HasIndex(u => u.Email).IsUnique();
        builder.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(u => u.LastName).HasMaxLength(100).IsRequired();
        builder.Property(u => u.PhoneNumber).HasMaxLength(20);
        builder.Property(u => u.Role).HasConversion<string>().HasMaxLength(30);
        builder.HasMany(u => u.Addresses).WithOne().HasForeignKey(a => a.UserId);
    }
}

public sealed class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.ToTable("Addresses", "identity");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Label).HasMaxLength(100).IsRequired();
        builder.Property(a => a.StreetLine1).HasMaxLength(255).IsRequired();
        builder.Property(a => a.StreetLine2).HasMaxLength(255);
        builder.Property(a => a.City).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Governorate).HasMaxLength(100).IsRequired();
        builder.Property(a => a.PostalCode).HasMaxLength(20).IsRequired();
    }
}

public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens", "identity");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Token).HasMaxLength(512).IsRequired();
        builder.HasIndex(t => t.Token).IsUnique();
    }
}
