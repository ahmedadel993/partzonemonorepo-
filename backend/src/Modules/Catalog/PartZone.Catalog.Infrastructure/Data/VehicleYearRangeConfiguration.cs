using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Infrastructure.Data;

internal sealed class VehicleYearRangeConfiguration : IEntityTypeConfiguration<VehicleYearRange>
{
    public void Configure(EntityTypeBuilder<VehicleYearRange> builder)
    {
        builder.ToTable("VehicleYearRanges", "catalog");
        builder.HasKey(y => y.Id);
    }
}
