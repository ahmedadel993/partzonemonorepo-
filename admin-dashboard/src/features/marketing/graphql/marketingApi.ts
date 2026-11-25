import { gql } from "@apollo/client";

export const PAGE_BLOCK_FRAGMENT = gql`
  fragment PageBlockFields on PageBlockType {
    id type sortOrder isActive activeFrom activeTo
    config bindingType targetId targetUrl
    translations { locale title subtitle ctaText configOverride }
  }
`;

export const GET_ALL_PAGE_BLOCKS = gql`
  ${PAGE_BLOCK_FRAGMENT}
  query GetAllPageBlocks {
    pageBlocks(onlyActive: false) { ...PageBlockFields }
  }
`;

export const CREATE_PAGE_BLOCK = gql`
  ${PAGE_BLOCK_FRAGMENT}
  mutation CreatePageBlock($input: CreatePageBlockInput!) {
    createPageBlock(input: $input) {
      pageBlock { ...PageBlockFields }
      errors
    }
  }
`;

export const UPDATE_PAGE_BLOCK = gql`
  ${PAGE_BLOCK_FRAGMENT}
  mutation UpdatePageBlock($input: UpdatePageBlockInput!) {
    updatePageBlock(input: $input) {
      pageBlock { ...PageBlockFields }
      errors
    }
  }
`;

export const ACTIVATE_PAGE_BLOCK = gql`
  ${PAGE_BLOCK_FRAGMENT}
  mutation ActivatePageBlock($id: ID!) {
    activatePageBlock(id: $id) { pageBlock { ...PageBlockFields } errors }
  }
`;

export const DEACTIVATE_PAGE_BLOCK = gql`
  ${PAGE_BLOCK_FRAGMENT}
  mutation DeactivatePageBlock($id: ID!) {
    deactivatePageBlock(id: $id) { pageBlock { ...PageBlockFields } errors }
  }
`;

export const DELETE_PAGE_BLOCK = gql`
  mutation DeletePageBlock($id: ID!) {
    deletePageBlock(id: $id) { errors }
  }
`;

export const REORDER_PAGE_BLOCKS = gql`
  ${PAGE_BLOCK_FRAGMENT}
  mutation ReorderPageBlocks($input: [ReorderItemInput!]!) {
    reorderPageBlocks(input: $input) { ...PageBlockFields }
  }
`;

export const COUPON_FRAGMENT = gql`
  fragment CouponFields on CouponType {
    id code discountType value minOrderAmount
    usageLimit perUserLimit usedCount validFrom validTo isActive
  }
`;

export const GET_ALL_COUPONS = gql`
  ${COUPON_FRAGMENT}
  query GetAllCoupons { coupons { ...CouponFields } }
`;

export const CREATE_COUPON = gql`
  ${COUPON_FRAGMENT}
  mutation CreateCoupon($input: CreateCouponInput!) {
    createCoupon(input: $input) { coupon { ...CouponFields } errors }
  }
`;

export const UPDATE_COUPON = gql`
  ${COUPON_FRAGMENT}
  mutation UpdateCoupon($input: UpdateCouponInput!) {
    updateCoupon(input: $input) { coupon { ...CouponFields } errors }
  }
`;

export const DEACTIVATE_COUPON = gql`
  ${COUPON_FRAGMENT}
  mutation DeactivateCoupon($id: ID!) {
    deactivateCoupon(id: $id) { coupon { ...CouponFields } errors }
  }
`;

export const ACTIVATE_COUPON = gql`
  ${COUPON_FRAGMENT}
  mutation ActivateCoupon($id: ID!) {
    activateCoupon(id: $id) { coupon { ...CouponFields } errors }
  }
`;

export const DELETE_COUPON = gql`
  mutation DeleteCoupon($id: ID!) {
    deleteCoupon(id: $id) { errors }
  }
`;

// Phase 6 – payment methods
export const PAYMENT_METHOD_FRAGMENT = gql`
  fragment PaymentMethodFields on PaymentMethodType {
    id key labelAr labelEn iconUrl isActive isComingSoon sortOrder
  }
`;

export const GET_ALL_PAYMENT_METHODS = gql`
  ${PAYMENT_METHOD_FRAGMENT}
  query GetAllPaymentMethods {
    paymentMethods(onlyActive: false) { ...PaymentMethodFields }
  }
`;

export const CREATE_PAYMENT_METHOD = gql`
  ${PAYMENT_METHOD_FRAGMENT}
  mutation CreatePaymentMethod($input: CreatePaymentMethodInput!) {
    createPaymentMethod(input: $input) { paymentMethod { ...PaymentMethodFields } errors }
  }
`;

export const UPDATE_PAYMENT_METHOD = gql`
  ${PAYMENT_METHOD_FRAGMENT}
  mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput!) {
    updatePaymentMethod(input: $input) { paymentMethod { ...PaymentMethodFields } errors }
  }
`;

export const ACTIVATE_PAYMENT_METHOD = gql`
  ${PAYMENT_METHOD_FRAGMENT}
  mutation ActivatePaymentMethod($id: ID!) {
    activatePaymentMethod(id: $id) { paymentMethod { ...PaymentMethodFields } errors }
  }
`;

export const DEACTIVATE_PAYMENT_METHOD = gql`
  ${PAYMENT_METHOD_FRAGMENT}
  mutation DeactivatePaymentMethod($id: ID!) {
    deactivatePaymentMethod(id: $id) { paymentMethod { ...PaymentMethodFields } errors }
  }
`;

export const DELETE_PAYMENT_METHOD = gql`
  mutation DeletePaymentMethod($id: ID!) {
    deletePaymentMethod(id: $id) { errors }
  }
`;

export const REORDER_PAYMENT_METHODS = gql`
  ${PAYMENT_METHOD_FRAGMENT}
  mutation ReorderPaymentMethods($input: [ReorderItemInput!]!) {
    reorderPaymentMethods(input: $input) { ...PaymentMethodFields }
  }
`;
