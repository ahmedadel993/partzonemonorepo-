# Architecture

## Module Structure

```
PartZone.sln
├── src/
│   ├── PartZone.Host/                  Entry point, DI composition, AppDbContext, migrations
│   ├── PartZone.Shared.Kernel/         Result<T>, Error, ICommand/IQuery, Entity, AggregateRoot
│   └── Modules/
│       ├── Identity/                   Users, Addresses, RefreshTokens, Complaints
│       ├── Catalog/                    Brand, Category, Product, VehicleFitment
│       ├── Orders/                     Order, OrderItem, Payment, Shipment
│       ├── Marketing/                  PageBlock, BrandPageBlock, ListPageBlock, Coupon
│       ├── StoreSettings/              PaymentMethod, ShipmentMethod
│       ├── Vendors/                    Vendor accounts + product approval
│       ├── Cart/                       Server-side cart, guest merge
│       ├── Checkout/                   Cart→Order lifecycle, idempotency
│       └── Erp/                        IErpConnector, Odoo/Oracle/SAIB stubs, sync log
```

Each module is a 4-project vertical slice: `Domain → Application → Infrastructure → Api`.
Modules communicate only through public Application interfaces — never through each other's internals.

## Data Model (ERD)

```mermaid
erDiagram
    User {
        Guid Id PK
        string Email UK
        string PasswordHash
        string FirstName
        string LastName
        string PhoneNumber
        UserRole Role
        bool IsActive
        DateTime CreatedAt
    }
    Address {
        Guid Id PK
        Guid UserId FK
        string Label
        string StreetLine1
        string City
        string Governorate
        bool IsDefault
    }
    RefreshToken {
        Guid Id PK
        Guid UserId FK
        string Token UK
        DateTime ExpiresAt
        bool IsRevoked
    }
    Brand {
        Guid Id PK
        string Name
        string Slug UK
        string Logo
        bool IsActive
    }
    VehicleMake {
        Guid Id PK
        string Name
        string Slug UK
        string Logo
    }
    VehicleModel {
        Guid Id PK
        Guid VehicleMakeId FK
        string Name
        string Slug
    }
    VehicleYearRange {
        Guid Id PK
        Guid VehicleModelId FK
        int YearFrom
        int YearTo
    }
    Category {
        Guid Id PK
        Guid ParentId FK
        string Name
        string Slug UK
        string Image
        int SortOrder
    }
    Product {
        Guid Id PK
        string SKU UK
        string OemNumber
        string Slug UK
        Guid BrandId FK
        Guid CategoryId FK
        string PartCondition
        decimal PriceAmount
        string PriceCurrency
        int Stock
        bool IsPublished
        float AvgRating
        int ReviewCount
    }
    ProductFitment {
        Guid ProductId FK
        Guid VehicleModelId FK
        int YearFrom
        int YearTo
    }
    PageBlock {
        Guid Id PK
        string Type
        int SortOrder
        bool IsActive
        DateTime ActiveFrom
        DateTime ActiveTo
        string Config
        string BindingType
        Guid TargetId
        string TargetUrl
    }
    Coupon {
        Guid Id PK
        string Code UK
        string Type
        decimal Value
        int UsageLimit
        int PerUserLimit
        DateTime ValidFrom
        DateTime ValidTo
    }
    Cart {
        Guid Id PK
        Guid UserId FK
        string SessionId
        DateTime UpdatedAt
    }
    CartItem {
        Guid Id PK
        Guid CartId FK
        Guid ProductId FK
        int Quantity
        decimal UnitPriceAtAdd
    }
    Order {
        Guid Id PK
        Guid UserId FK
        string Status
        decimal TotalAmount
        string Currency
        Guid CouponId FK
        DateTime CreatedAt
    }
    OrderItem {
        Guid Id PK
        Guid OrderId FK
        Guid ProductId FK
        int Quantity
        decimal UnitPrice
    }
    Payment {
        Guid Id PK
        Guid OrderId FK
        string Method
        string Status
        decimal Amount
        string TransactionRef
    }
    Shipment {
        Guid Id PK
        Guid OrderId FK
        string Method
        string TrackingNumber
        string Status
    }
    Vendor {
        Guid Id PK
        Guid UserId FK
        string BusinessName
        string Status
        DateTime ApprovedAt
    }

    User ||--o{ Address : has
    User ||--o{ RefreshToken : has
    Product }o--|| Brand : "made by"
    Product }o--|| Category : "belongs to"
    Product ||--o{ ProductFitment : fits
    ProductFitment }o--|| VehicleModel : "for model"
    VehicleModel }o--|| VehicleMake : "belongs to"
    VehicleModel ||--o{ VehicleYearRange : "available years"
    Category ||--o| Category : parent
    Cart ||--o{ CartItem : contains
    Order ||--o{ OrderItem : contains
    Order ||--o| Payment : "paid via"
    Order ||--o| Shipment : "shipped via"
    Order }o--|| User : "placed by"
    Vendor }o--|| User : "owned by"
```

## API Layer Split

| API | Endpoint | Consumer | Why |
|---|---|---|---|
| GraphQL (HotChocolate) | `/graphql` | Admin dashboard (Apollo Client) | Rich queries, cache, type generation |
| REST (Minimal APIs) | `/api/v1/` | Storefront Server Actions | Simple fetch, no client bundle overhead |

Both layers are thin wrappers over the same MediatR handlers in the Application layer.
