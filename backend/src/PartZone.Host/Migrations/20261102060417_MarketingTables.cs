using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PartZone.Host.Migrations
{
    /// <inheritdoc />
    public partial class MarketingTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "marketing");

            migrationBuilder.CreateTable(
                name: "Coupons",
                schema: "marketing",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DiscountType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Value = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    MinOrderAmount = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    UsageLimit = table.Column<int>(type: "int", nullable: false),
                    PerUserLimit = table.Column<int>(type: "int", nullable: false),
                    UsedCount = table.Column<int>(type: "int", nullable: false),
                    ValidFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ValidTo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coupons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PageBlocks",
                schema: "marketing",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    ActiveFrom = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Config = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BindingType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TargetId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TargetUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PageBlocks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CouponUsages",
                schema: "marketing",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CouponId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CouponUsages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CouponUsages_Coupons_CouponId",
                        column: x => x.CouponId,
                        principalSchema: "marketing",
                        principalTable: "Coupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PageBlockTranslations",
                schema: "marketing",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PageBlockId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Locale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Subtitle = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CtaText = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ConfigOverride = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PageBlockTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PageBlockTranslations_PageBlocks_PageBlockId",
                        column: x => x.PageBlockId,
                        principalSchema: "marketing",
                        principalTable: "PageBlocks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_Code",
                schema: "marketing",
                table: "Coupons",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CouponUsages_CouponId_UserId",
                schema: "marketing",
                table: "CouponUsages",
                columns: new[] { "CouponId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_PageBlocks_IsActive_SortOrder",
                schema: "marketing",
                table: "PageBlocks",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_PageBlockTranslations_PageBlockId_Locale",
                schema: "marketing",
                table: "PageBlockTranslations",
                columns: new[] { "PageBlockId", "Locale" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CouponUsages",
                schema: "marketing");

            migrationBuilder.DropTable(
                name: "PageBlockTranslations",
                schema: "marketing");

            migrationBuilder.DropTable(
                name: "Coupons",
                schema: "marketing");

            migrationBuilder.DropTable(
                name: "PageBlocks",
                schema: "marketing");
        }
    }
}
