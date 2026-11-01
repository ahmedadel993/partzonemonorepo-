using PartZone.Catalog.Domain.Entities;

namespace PartZone.Catalog.Application.Interfaces;

public interface ICatalogWriteRepository
{
    void AddBrand(Brand brand);
    void UpdateBrand(Brand brand);
    void AddCategory(Category category);
    void UpdateCategory(Category category);
    void AddProduct(Product product);
    void UpdateProduct(Product product);
    void AddVehicleMake(VehicleMake make);
    void AddVehicleModel(VehicleModel model);
    void AddVehicleYearRange(VehicleYearRange range);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
