import { gql } from "@apollo/client";

// ── Fragments ─────────────────────────────────────────────────────────────────

export const BRAND_FIELDS = gql`
  fragment BrandFields on BrandType {
    id name slug logoUrl isActive
    isFeatured showInHome isSponsored
  }
`;

export const CATEGORY_FIELDS = gql`
  fragment CategoryFields on CategoryType {
    id name slug imageUrl sortOrder parentId
    isActive isFeatured showInHome showInMenu
    children { id name slug sortOrder }
  }
`;

export const PRODUCT_SUMMARY_FIELDS = gql`
  fragment ProductSummaryFields on ProductSummaryType {
    id sku slug name condition
    priceAmount priceCurrency
    stock isPublished primaryImageUrl
    brandName categoryName brandId categoryId
    isFeatured isBestSeller isNew isOnSale
  }
`;

// ── Queries ───────────────────────────────────────────────────────────────────

export const GET_BRANDS = gql`
  ${BRAND_FIELDS}
  query GetBrands { brands { ...BrandFields } }
`;

export const GET_CATEGORIES = gql`
  ${CATEGORY_FIELDS}
  query GetCategories { categories { ...CategoryFields } }
`;

export const GET_PRODUCTS = gql`
  ${PRODUCT_SUMMARY_FIELDS}
  query GetProducts($filter: ProductFilterInput!) {
    products(filter: $filter) {
      items { ...ProductSummaryFields }
      totalCount page pageSize totalPages
    }
  }
`;

export const GET_VEHICLE_MAKES = gql`
  query GetVehicleMakes {
    vehicleMakes { id name slug logoUrl }
  }
`;

export const GET_VEHICLE_MODELS = gql`
  query GetVehicleModels($makeId: ID!) {
    vehicleModels(makeId: $makeId) { id name slug vehicleMakeId }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    product(slug: $slug) {
      id slug description
      images { id url altText isPrimary }
    }
  }
`;

// Phase 4 – detail page queries (productById returns ProductDetailType, not ProductSummaryType)
export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    productById(id: $id) {
      id sku slug name condition
      priceAmount priceCurrency
      stock isPublished
      isFeatured isBestSeller isNew isOnSale
      brand { id name }
      category { id name }
      images { url isPrimary }
    }
  }
`;

export const GET_CATEGORY_BY_ID = gql`
  ${CATEGORY_FIELDS}
  query GetCategoryById($id: ID!) {
    categoryById(id: $id) { ...CategoryFields }
  }
`;

export const GET_BRAND_BY_ID = gql`
  ${BRAND_FIELDS}
  query GetBrandById($id: ID!) {
    brandById(id: $id) { ...BrandFields }
  }
`;

const PRODUCT_IMAGES_FIELDS = `product { id images { id url altText isPrimary } } errors`;

export const ADD_PRODUCT_IMAGE = gql`
  mutation AddProductImage($input: AddProductImageInput!) {
    addProductImage(input: $input) { ${PRODUCT_IMAGES_FIELDS} }
  }
`;

export const REMOVE_PRODUCT_IMAGE = gql`
  mutation RemoveProductImage($productId: ID!, $imageId: ID!) {
    removeProductImage(productId: $productId, imageId: $imageId) { ${PRODUCT_IMAGES_FIELDS} }
  }
`;

export const SET_PRIMARY_PRODUCT_IMAGE = gql`
  mutation SetPrimaryProductImage($productId: ID!, $imageId: ID!) {
    setPrimaryProductImage(productId: $productId, imageId: $imageId) { ${PRODUCT_IMAGES_FIELDS} }
  }
`;

// ── Mutations ─────────────────────────────────────────────────────────────────

export const CREATE_BRAND = gql`
  ${BRAND_FIELDS}
  mutation CreateBrand($input: CreateBrandInput!) {
    createBrand(input: $input) {
      brand { ...BrandFields }
      errors
    }
  }
`;

export const UPDATE_BRAND = gql`
  ${BRAND_FIELDS}
  mutation UpdateBrand($input: UpdateBrandInput!) {
    updateBrand(input: $input) {
      brand { ...BrandFields }
      errors
    }
  }
`;

export const CREATE_CATEGORY = gql`
  ${CATEGORY_FIELDS}
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      category { ...CategoryFields }
      errors
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      category { id }
      errors
    }
  }
`;

export const CREATE_VEHICLE_MAKE = gql`
  mutation CreateVehicleMake($input: CreateVehicleMakeInput!) {
    createVehicleMake(input: $input) {
      make { id name slug }
      errors
    }
  }
`;

export const CREATE_VEHICLE_MODEL = gql`
  mutation CreateVehicleModel($input: CreateVehicleModelInput!) {
    createVehicleModel(input: $input) {
      model { id name slug }
      errors
    }
  }
`;

export const UPDATE_VEHICLE_MAKE = gql`
  mutation UpdateVehicleMake($input: UpdateVehicleMakeInput!) {
    updateVehicleMake(input: $input) {
      errors
    }
  }
`;

export const DELETE_VEHICLE_MAKE = gql`
  mutation DeleteVehicleMake($id: ID!) {
    deleteVehicleMake(id: $id) {
      errors
    }
  }
`;

export const UPDATE_VEHICLE_MODEL = gql`
  mutation UpdateVehicleModel($input: UpdateVehicleModelInput!) {
    updateVehicleModel(input: $input) {
      errors
    }
  }
`;

export const DELETE_VEHICLE_MODEL = gql`
  mutation DeleteVehicleModel($id: ID!) {
    deleteVehicleModel(id: $id) {
      errors
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      product { id sku slug name condition priceAmount priceCurrency stock isPublished }
      errors
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product { id sku slug name condition priceAmount priceCurrency stock isPublished }
      errors
    }
  }
`;

export const PUBLISH_PRODUCT = gql`
  mutation PublishProduct($productId: ID!) {
    publishProduct(productId: $productId) {
      product { id isPublished }
      errors
    }
  }
`;

export const UNPUBLISH_PRODUCT = gql`
  mutation UnpublishProduct($productId: ID!) {
    unpublishProduct(productId: $productId) {
      product { id isPublished }
      errors
    }
  }
`;

// Phase 4 – brand activate/deactivate mutations
export const ACTIVATE_BRAND = gql`
  ${BRAND_FIELDS}
  mutation ActivateBrand($brandId: ID!) {
    activateBrand(brandId: $brandId) {
      brand { ...BrandFields }
      errors
    }
  }
`;

export const DEACTIVATE_BRAND = gql`
  ${BRAND_FIELDS}
  mutation DeactivateBrand($brandId: ID!) {
    deactivateBrand(brandId: $brandId) {
      brand { ...BrandFields }
      errors
    }
  }
`;

export const DELETE_BRAND = gql`
  mutation DeleteBrand($id: ID!) {
    deleteBrand(id: $id) {
      errors
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      errors
    }
  }
`;

export const ACTIVATE_CATEGORY = gql`
  ${CATEGORY_FIELDS}
  mutation ActivateCategory($id: ID!) {
    activateCategory(id: $id) {
      category { ...CategoryFields }
      errors
    }
  }
`;

export const DEACTIVATE_CATEGORY = gql`
  ${CATEGORY_FIELDS}
  mutation DeactivateCategory($id: ID!) {
    deactivateCategory(id: $id) {
      category { ...CategoryFields }
      errors
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      errors
    }
  }
`;
