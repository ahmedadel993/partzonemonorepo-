using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Infrastructure.Data;

internal sealed class ProductTranslationConfiguration : IEntityTypeConfiguration<ProductTranslation>
{
    public void Configure(EntityTypeBuilder<ProductTranslation> builder)
    {
        builder.ToTable("ProductTranslations", "catalog");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Locale).HasMaxLength(5).IsRequired();
        builder.Property(t => t.Name).HasMaxLength(300).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(2000);
        builder.HasIndex(t => new { t.ProductId, t.Locale }).IsUnique();
    }
}
