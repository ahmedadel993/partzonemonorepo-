export interface VehicleMake {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface VehicleModel {
  id: string;
  name: string;
  slug: string;
  vehicleMakeId: string;
}
