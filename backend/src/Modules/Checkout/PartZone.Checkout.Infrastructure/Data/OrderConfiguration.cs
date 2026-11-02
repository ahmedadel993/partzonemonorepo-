using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Checkout.Domain.Entities;

namespace PartZone.Checkout.Infrastructure.Data;

internal sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders", "orders");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.OrderNumber).HasMaxLength(30).IsRequired();
        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.Property(o => o.UserId).IsRequired();
        builder.Property(o => o.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(o => o.CouponCode).HasMaxLength(50);
        builder.Property(o => o.Notes).HasMaxLength(1000);
        builder.Property(o => o.SubTotal).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(o => o.DiscountAmount).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(o => o.ShippingFee).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(o => o.Total).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(o => o.PlacedAt).IsRequired();

        builder.HasIndex(o => o.UserId);

        builder.OwnsOne(o => o.ShippingAddress, sa =>
        {
            sa.Property(s => s.FullName).HasColumnName("ShippingFullName").HasMaxLength(200).IsRequired();
            sa.Property(s => s.Phone).HasColumnName("ShippingPhone").HasMaxLength(20).IsRequired();
            sa.Property(s => s.AddressLine1).HasColumnName("ShippingAddressLine1").HasMaxLength(500).IsRequired();
            sa.Property(s => s.AddressLine2).HasColumnName("ShippingAddressLine2").HasMaxLength(500);
            sa.Property(s => s.City).HasColumnName("ShippingCity").HasMaxLength(100).IsRequired();
            sa.Property(s => s.Governorate).HasColumnName("ShippingGovernorate").HasMaxLength(100).IsRequired();
            sa.Property(s => s.PostalCode).HasColumnName("ShippingPostalCode").HasMaxLength(20).IsRequired();
        });

        builder.HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(o => o.Items).HasField("_items");
    }
}
