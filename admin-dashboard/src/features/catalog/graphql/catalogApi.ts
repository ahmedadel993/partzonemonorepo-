import { gql } from "@apollo/client";

// ── Fragments ─────────────────────────────────────────────────────────────────

export const BRAND_FIELDS = gql`
  fragment BrandFields on BrandType {
    id name slug logoUrl isActive
  }
`;

export const CATEGORY_FIELDS = gql`
  fragment CategoryFields on CategoryType {
    id name slug imageUrl sortOrder parentId
    children { id name slug sortOrder }
  }
`;

export const PRODUCT_SUMMARY_FIELDS = gql`
  fragment ProductSummaryFields on ProductSummaryType {
    id sku slug name condition
    priceAmount priceCurrency
    stock isPublished primaryImageUrl
    brandName categoryName brandId categoryId
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
