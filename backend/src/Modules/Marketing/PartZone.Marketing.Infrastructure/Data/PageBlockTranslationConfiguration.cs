using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PartZone.Marketing.Domain.Entities;

namespace PartZone.Marketing.Infrastructure.Data;

internal sealed class PageBlockTranslationConfiguration : IEntityTypeConfiguration<PageBlockTranslation>
{
    public void Configure(EntityTypeBuilder<PageBlockTranslation> builder)
    {
        builder.ToTable("PageBlockTranslations", "marketing");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Locale).HasMaxLength(10).IsRequired();
        builder.Property(t => t.Title).HasMaxLength(300);
        builder.Property(t => t.Subtitle).HasMaxLength(500);
        builder.Property(t => t.CtaText).HasMaxLength(100);
        builder.Property(t => t.ConfigOverride).HasColumnType("nvarchar(max)");
        builder.HasIndex(t => new { t.PageBlockId, t.Locale }).IsUnique();
        builder.HasOne<PageBlock>()
            .WithMany(b => b.Translations)
            .HasForeignKey(t => t.PageBlockId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
