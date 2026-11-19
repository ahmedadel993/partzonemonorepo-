using Microsoft.EntityFrameworkCore;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Infrastructure;

internal sealed class CatalogWriteRepository(DbContext db) : ICatalogWriteRepository
{
    public void AddBrand(Brand brand) => db.Set<Brand>().Add(brand);
    public void UpdateBrand(Brand brand) => db.Set<Brand>().Update(brand);
    public void RemoveBrand(Brand brand) => db.Set<Brand>().Remove(brand);
    public void AddCategory(Category category) => db.Set<Category>().Add(category);
    public void UpdateCategory(Category category) => db.Set<Category>().Update(category);
    public void RemoveCategory(Category category) => db.Set<Category>().Remove(category);
    public void AddProduct(Product product) => db.Set<Product>().Add(product);
    public void UpdateProduct(Product product)
    {
        // Products are loaded with AsNoTracking, so Update() marks every child
        // with a key as Modified — including children just added in the domain
        // (their Guid keys are generated client-side). Those would be sent as
        // UPDATEs that hit 0 rows and throw DbUpdateConcurrencyException.
        // Mark children that don't exist in the database yet as Added.
        db.Set<Product>().Update(product);

        var children = db.ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Modified
                && e.Entity is ProductFitment or ProductImage or ProductTranslation)
            .ToList();

        foreach (var entry in children)
        {
            if (entry.GetDatabaseValues() is null)
                entry.State = EntityState.Added;
        }
    }
    public void RemoveProduct(Product product) => db.Set<Product>().Remove(product);
    public void RemoveProductImage(ProductImage image) => db.Set<ProductImage>().Remove(image);

    public void AddVehicleMake(VehicleMake make) => db.Set<VehicleMake>().Add(make);
    public void UpdateVehicleMake(VehicleMake make) => db.Set<VehicleMake>().Update(make);
    public void RemoveVehicleMake(VehicleMake make) => db.Set<VehicleMake>().Remove(make);
    public void AddVehicleModel(VehicleModel model) => db.Set<VehicleModel>().Add(model);
    public void UpdateVehicleModel(VehicleModel model) => db.Set<VehicleModel>().Update(model);
    public void RemoveVehicleModel(VehicleModel model) => db.Set<VehicleModel>().Remove(model);
    public void AddVehicleYearRange(VehicleYearRange range) => db.Set<VehicleYearRange>().Add(range);
    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}
