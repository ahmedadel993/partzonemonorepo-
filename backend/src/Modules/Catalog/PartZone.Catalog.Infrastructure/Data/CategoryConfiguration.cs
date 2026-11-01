using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Infrastructure.Data;

internal sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories", "catalog");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).HasMaxLength(200).IsRequired();
        builder.Property(c => c.Slug).HasMaxLength(200).IsRequired();
        builder.Property(c => c.ImageUrl).HasMaxLength(500);
        builder.HasIndex(c => c.Slug).IsUnique();
        builder.HasOne<Category>().WithMany(c => c.Children).HasForeignKey(c => c.ParentId).IsRequired(false).OnDelete(DeleteBehavior.Restrict);
    }
}
