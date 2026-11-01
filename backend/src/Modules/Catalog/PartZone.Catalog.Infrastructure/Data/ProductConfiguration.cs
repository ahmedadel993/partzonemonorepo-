using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Infrastructure.Data;

internal sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products", "catalog");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.SKU).HasMaxLength(100).IsRequired();
        builder.Property(p => p.OemNumber).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Slug).HasMaxLength(300).IsRequired();
        builder.HasIndex(p => p.SKU).IsUnique();
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.HasIndex(p => p.OemNumber);
        builder.HasIndex(p => p.BrandId);
        builder.HasIndex(p => p.CategoryId);
        builder.Property(p => p.Condition).HasConversion<string>().HasMaxLength(20);
        builder.OwnsOne(p => p.Price, price =>
        {
            price.Property(m => m.Amount).HasColumnName("PriceAmount").HasPrecision(18, 2);
            price.Property(m => m.Currency).HasColumnName("PriceCurrency").HasMaxLength(3);
        });
        builder.HasMany(p => p.Images).WithOne().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(p => p.Translations).WithOne().HasForeignKey(t => t.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(p => p.Fitments).WithOne().HasForeignKey(f => f.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}
