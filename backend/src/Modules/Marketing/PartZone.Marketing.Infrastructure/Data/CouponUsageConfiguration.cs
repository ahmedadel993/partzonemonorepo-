using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Marketing.Domain.Entities;

namespace PartZone.Marketing.Infrastructure.Data;

internal sealed class CouponUsageConfiguration : IEntityTypeConfiguration<CouponUsage>
{
    public void Configure(EntityTypeBuilder<CouponUsage> builder)
    {
        builder.ToTable("CouponUsages", "marketing");
        builder.HasKey(u => u.Id);
        builder.HasIndex(u => new { u.CouponId, u.UserId });
        builder.HasOne<Coupon>()
            .WithMany()
            .HasForeignKey(u => u.CouponId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
