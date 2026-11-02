using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CartEntity = PartZone.Cart.Domain.Entities.Cart;
using CartItemEntity = PartZone.Cart.Domain.Entities.CartItem;

namespace PartZone.Cart.Infrastructure.Data;

internal sealed class CartConfiguration : IEntityTypeConfiguration<CartEntity>
{
    public void Configure(EntityTypeBuilder<CartEntity> builder)
    {
        builder.ToTable("Carts", "cart");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.UserId).IsRequired();
        builder.Property(c => c.CouponCode).HasMaxLength(50);
        builder.HasIndex(c => c.UserId).IsUnique();

        builder.Ignore(c => c.SubTotal);
        builder.Ignore(c => c.ItemCount);

        builder.HasMany(c => c.Items)
            .WithOne()
            .HasForeignKey(i => i.CartId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(c => c.Items).HasField("_items");
    }
}
