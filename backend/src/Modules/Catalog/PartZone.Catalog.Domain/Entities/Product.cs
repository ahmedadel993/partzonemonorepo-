using PartZone.Catalog.Domain.Enums;
using PartZone.Catalog.Domain.Events;
using PartZone.Catalog.Domain.ValueObjects;
using PartZone.Shared.Kernel.Domain;

namespace PartZone.Catalog.Domain.Entities;

public sealed class Product : AggregateRoot<Guid>
{
    public string SKU { get; private set; } = default!;
    public string OemNumber { get; private set; } = default!;
    public string Slug { get; private set; } = default!;
    public Guid BrandId { get; private set; }
    public Guid CategoryId { get; private set; }
    public PartCondition Condition { get; private set; }
    public Money Price { get; private set; } = default!;
    public int Stock { get; private set; }
    public bool IsPublished { get; private set; }
    public float AvgRating { get; private set; }
    public int ReviewCount { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private readonly List<ProductImage> _images = [];
    private readonly List<ProductTranslation> _translations = [];
    private readonly List<ProductFitment> _fitments = [];

    public IReadOnlyCollection<ProductImage> Images => _images.AsReadOnly();
    public IReadOnlyCollection<ProductTranslation> Translations => _translations.AsReadOnly();
    public IReadOnlyCollection<ProductFitment> Fitments => _fitments.AsReadOnly();

    private Product() : base(Guid.Empty) { }

    public static Product Create(
        string sku, string slug, string oemNumber,
        Guid brandId, Guid categoryId,
        PartCondition condition, Money price, int stock) =>
        new()
        {
            Id = Guid.NewGuid(),
            SKU = sku,
            OemNumber = oemNumber,
            Slug = slug,
            BrandId = brandId,
            CategoryId = categoryId,
            Condition = condition,
            Price = price,
            Stock = stock,
            IsPublished = false,
            CreatedAt = DateTime.UtcNow
        };

    public void Publish()
    {
        IsPublished = true;
        RaiseDomainEvent(new ProductPublishedEvent(Id));
    }

    public void Unpublish() => IsPublished = false;

    public void UpdateStock(int quantity)
    {
        Stock = quantity;
        RaiseDomainEvent(new ProductStockUpdatedEvent(Id, quantity));
    }

    public void Update(string slug, Guid brandId, Guid categoryId, PartCondition condition, Money price)
    {
        Slug = slug;
        BrandId = brandId;
        CategoryId = categoryId;
        Condition = condition;
        Price = price;
    }

    public void AddImage(string url, string altText, bool isPrimary)
    {
        if (isPrimary)
            foreach (var img in _images) img.IsPrimary = false;
        _images.Add(ProductImage.Create(Id, url, altText, isPrimary, _images.Count));
    }

    public void AddTranslation(string locale, string name, string? description)
    {
        _translations.RemoveAll(t => t.Locale == locale);
        _translations.Add(ProductTranslation.Create(Id, locale, name, description));
    }

    public void AddFitment(Guid modelId, int yearFrom, int yearTo)
    {
        if (!_fitments.Any(f => f.VehicleModelId == modelId && f.YearFrom == yearFrom && f.YearTo == yearTo))
            _fitments.Add(ProductFitment.Create(Id, modelId, yearFrom, yearTo));
    }

    public void RemoveFitment(Guid modelId, int yearFrom, int yearTo) =>
        _fitments.RemoveAll(f => f.VehicleModelId == modelId && f.YearFrom == yearFrom && f.YearTo == yearTo);
}
