using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Infrastructure.Data;

internal sealed class ProductFitmentConfiguration : IEntityTypeConfiguration<ProductFitment>
{
    public void Configure(EntityTypeBuilder<ProductFitment> builder)
    {
        builder.ToTable("ProductFitments", "catalog");
        builder.HasKey(f => f.Id);
        builder.HasIndex(f => new { f.ProductId, f.VehicleModelId, f.YearFrom, f.YearTo });
    }
}
