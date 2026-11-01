using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Infrastructure.Data;

internal sealed class VehicleMakeConfiguration : IEntityTypeConfiguration<VehicleMake>
{
    public void Configure(EntityTypeBuilder<VehicleMake> builder)
    {
        builder.ToTable("VehicleMakes", "catalog");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Name).HasMaxLength(200).IsRequired();
        builder.Property(m => m.Slug).HasMaxLength(200).IsRequired();
        builder.Property(m => m.LogoUrl).HasMaxLength(500);
        builder.HasIndex(m => m.Slug).IsUnique();
        builder.HasMany(m => m.Models).WithOne().HasForeignKey(m => m.VehicleMakeId).OnDelete(DeleteBehavior.Cascade);
    }
}
