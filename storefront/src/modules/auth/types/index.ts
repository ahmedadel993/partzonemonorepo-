export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  streetLine1: string;
  streetLine2?: string | null;
  city: string;
  governorate: string;
  postalCode: string;
  isDefault: boolean;
}
