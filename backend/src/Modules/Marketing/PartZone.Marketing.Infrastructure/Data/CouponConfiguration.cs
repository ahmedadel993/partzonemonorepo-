using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Marketing.Domain.Entities;

namespace PartZone.Marketing.Infrastructure.Data;

internal sealed class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("Coupons", "marketing");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Code).HasMaxLength(50).IsRequired();
        builder.Property(c => c.DiscountType).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(c => c.Value).HasColumnType("decimal(18,4)").IsRequired();
        builder.Property(c => c.MinOrderAmount).HasColumnType("decimal(18,4)");
        builder.HasIndex(c => c.Code).IsUnique();
    }
}
