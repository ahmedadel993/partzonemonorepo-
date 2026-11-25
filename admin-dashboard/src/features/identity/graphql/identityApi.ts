import { gql } from "@apollo/client";

const USER_FIELDS = gql`
  fragment UserFields on UserType {
    id
    email
    firstName
    lastName
    phoneNumber
    role
    isActive
    createdAt
  }
`;

const VENDOR_FIELDS = gql`
  fragment VendorFields on VendorGqlType {
    id
    userId
    companyName
    taxId
    phoneNumber
    commissionRate
    status
    createdAt
  }
`;

export const GET_USERS = gql`
  query GetUsers($role: String) {
    users(role: $role) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export const GET_VENDORS = gql`
  query GetVendors {
    gqlVendors {
      ...VendorFields
    }
  }
  ${VENDOR_FIELDS}
`;

export const ADMIN_CREATE_USER = gql`
  mutation AdminCreateUser($input: AdminCreateUserInput!) {
    adminCreateUser(input: $input) {
      user {
        ...UserFields
      }
      errors
    }
  }
  ${USER_FIELDS}
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        ...UserFields
      }
      errors
    }
  }
  ${USER_FIELDS}
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      errors
    }
  }
`;

export const ADMIN_CREATE_VENDOR = gql`
  mutation AdminCreateVendor($input: AdminCreateVendorInput!) {
    adminCreateVendor(input: $input) {
      vendor {
        ...VendorFields
      }
      errors
    }
  }
  ${VENDOR_FIELDS}
`;

export const UPDATE_VENDOR = gql`
  mutation UpdateVendor($input: UpdateVendorInput!) {
    updateVendor(input: $input) {
      vendor {
        ...VendorFields
      }
      errors
    }
  }
  ${VENDOR_FIELDS}
`;

export const DELETE_VENDOR = gql`
  mutation DeleteVendor($id: ID!) {
    deleteVendor(id: $id) {
      errors
    }
  }
`;

export const ACTIVATE_USER = gql`
  mutation ActivateUser($id: ID!) {
    activateUser(id: $id) {
      user {
        ...UserFields
      }
      errors
    }
  }
  ${USER_FIELDS}
`;

export const DEACTIVATE_USER = gql`
  mutation DeactivateUser($id: ID!) {
    deactivateUser(id: $id) {
      user {
        ...UserFields
      }
      errors
    }
  }
  ${USER_FIELDS}
`;

export const APPROVE_VENDOR = gql`
  mutation ApproveVendor($id: ID!) {
    approveVendor(id: $id) {
      vendor {
        ...VendorFields
      }
      errors
    }
  }
  ${VENDOR_FIELDS}
`;

export const SUSPEND_VENDOR = gql`
  mutation SuspendVendor($id: ID!) {
    suspendVendor(id: $id) {
      vendor {
        ...VendorFields
      }
      errors
    }
  }
  ${VENDOR_FIELDS}
`;
