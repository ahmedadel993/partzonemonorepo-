// Phase 6 – Dynamic payment methods
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Marketing.Domain.Entities;

namespace PartZone.Marketing.Infrastructure.Data;

internal sealed class PaymentMethodConfiguration : IEntityTypeConfiguration<PaymentMethod>
{
    public void Configure(EntityTypeBuilder<PaymentMethod> builder)
    {
        builder.ToTable("PaymentMethods", "marketing");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Key).HasMaxLength(100).IsRequired();
        builder.HasIndex(p => p.Key).IsUnique();
        builder.Property(p => p.LabelAr).HasMaxLength(200).IsRequired();
        builder.Property(p => p.LabelEn).HasMaxLength(200).IsRequired();
        builder.Property(p => p.IconUrl).HasMaxLength(500);
    }
}
