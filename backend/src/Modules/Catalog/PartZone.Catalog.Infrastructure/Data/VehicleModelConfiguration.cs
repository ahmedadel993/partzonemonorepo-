using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Infrastructure.Data;

internal sealed class VehicleModelConfiguration : IEntityTypeConfiguration<VehicleModel>
{
    public void Configure(EntityTypeBuilder<VehicleModel> builder)
    {
        builder.ToTable("VehicleModels", "catalog");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Name).HasMaxLength(200).IsRequired();
        builder.Property(m => m.Slug).HasMaxLength(200).IsRequired();
        builder.HasMany(m => m.YearRanges).WithOne().HasForeignKey(y => y.VehicleModelId).OnDelete(DeleteBehavior.Cascade);
    }
}
