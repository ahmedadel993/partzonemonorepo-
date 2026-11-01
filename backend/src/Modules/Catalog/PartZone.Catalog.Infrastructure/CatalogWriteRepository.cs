using Microsoft.EntityFrameworkCore;
using PartZone.Catalog.Application.Interfaces;
using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Infrastructure;

internal sealed class CatalogWriteRepository(DbContext db) : ICatalogWriteRepository
{
    public void AddBrand(Brand brand) => db.Set<Brand>().Add(brand);
    public void UpdateBrand(Brand brand) => db.Set<Brand>().Update(brand);
    public void AddCategory(Category category) => db.Set<Category>().Add(category);
    public void UpdateCategory(Category category) => db.Set<Category>().Update(category);
    public void AddProduct(Product product) => db.Set<Product>().Add(product);
    public void UpdateProduct(Product product) => db.Set<Product>().Update(product);
    public void AddVehicleMake(VehicleMake make) => db.Set<VehicleMake>().Add(make);
    public void AddVehicleModel(VehicleModel model) => db.Set<VehicleModel>().Add(model);
    public void AddVehicleYearRange(VehicleYearRange range) => db.Set<VehicleYearRange>().Add(range);
    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}
