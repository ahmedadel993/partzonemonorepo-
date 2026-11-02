using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Marketing.Domain.Entities;

namespace PartZone.Marketing.Infrastructure.Data;

internal sealed class PageBlockConfiguration : IEntityTypeConfiguration<PageBlock>
{
    public void Configure(EntityTypeBuilder<PageBlock> builder)
    {
        builder.ToTable("PageBlocks", "marketing");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Type).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(b => b.BindingType).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(b => b.Config).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(b => b.TargetUrl).HasMaxLength(500);
        builder.HasIndex(b => new { b.IsActive, b.SortOrder });
    }
}
