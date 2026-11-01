using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Infrastructure.Data;

internal sealed class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages", "catalog");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Url).HasMaxLength(500).IsRequired();
        builder.Property(i => i.AltText).HasMaxLength(300).IsRequired();
    }
}
