using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PartZone.Host.Migrations
{
    /// <inheritdoc />
    public partial class AddEntityBooleanFlags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsBestSeller",
                schema: "catalog",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                schema: "catalog",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsNew",
                schema: "catalog",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsOnSale",
                schema: "catalog",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "catalog",
                table: "Categories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                schema: "catalog",
                table: "Categories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowInHome",
                schema: "catalog",
                table: "Categories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowInMenu",
                schema: "catalog",
                table: "Categories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                schema: "catalog",
                table: "Brands",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSponsored",
                schema: "catalog",
                table: "Brands",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowInHome",
                schema: "catalog",
                table: "Brands",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsBestSeller",
                schema: "catalog",
                table: "Products",
                column: "IsBestSeller");

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsFeatured",
                schema: "catalog",
                table: "Products",
                column: "IsFeatured");

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsNew",
                schema: "catalog",
                table: "Products",
                column: "IsNew");

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsOnSale",
                schema: "catalog",
                table: "Products",
                column: "IsOnSale");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Products_IsBestSeller",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_IsFeatured",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_IsNew",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_IsOnSale",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsBestSeller",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsNew",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsOnSale",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "catalog",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                schema: "catalog",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "ShowInHome",
                schema: "catalog",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "ShowInMenu",
                schema: "catalog",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                schema: "catalog",
                table: "Brands");

            migrationBuilder.DropColumn(
                name: "IsSponsored",
                schema: "catalog",
                table: "Brands");

            migrationBuilder.DropColumn(
                name: "ShowInHome",
                schema: "catalog",
                table: "Brands");
        }
    }
}
