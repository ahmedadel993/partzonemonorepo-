using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Checkout.Domain.Entities;

namespace PartZone.Checkout.Infrastructure.Data;

internal sealed class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems", "orders");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.OrderId).IsRequired();
        builder.Property(i => i.ProductId).IsRequired();
        builder.Property(i => i.SKU).HasMaxLength(100).IsRequired();
        builder.Property(i => i.Name).HasMaxLength(500).IsRequired();
        builder.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(i => i.Quantity).IsRequired();
        builder.Property(i => i.SubTotal).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(i => i.ImageUrl).HasMaxLength(1000);
    }
}
