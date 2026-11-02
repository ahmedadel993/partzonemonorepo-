using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CartItemEntity = PartZone.Cart.Domain.Entities.CartItem;

namespace PartZone.Cart.Infrastructure.Data;

internal sealed class CartItemConfiguration : IEntityTypeConfiguration<CartItemEntity>
{
    public void Configure(EntityTypeBuilder<CartItemEntity> builder)
    {
        builder.ToTable("CartItems", "cart");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.CartId).IsRequired();
        builder.Property(i => i.ProductId).IsRequired();
        builder.Property(i => i.SKU).HasMaxLength(100).IsRequired();
        builder.Property(i => i.Name).HasMaxLength(500).IsRequired();
        builder.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(i => i.Quantity).IsRequired();
        builder.Property(i => i.ImageUrl).HasMaxLength(1000);

        builder.Ignore(i => i.SubTotal);
    }
}
