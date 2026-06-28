export interface Pharmacy {
  _id?: string;
  shopName: string;
  phone: string;
  location: string;
  ownerName?: string;
  panNumber?: string;
  lat?: number;
  lng?: number;
  isActive?: boolean;
}

export interface Medicine {
  _id: string;
  pharmacyId?: string;
  medicineName: string;
  category: string;
  status: 'Available' | 'Out_of_Stock';
  reportCount: number;
  lastUpdated: string | Date;
  pharmacy: Pharmacy | null;
  distanceKm?: number;
  isFlagged?: boolean;
}

export interface User {
  id: string;
  _id?: string;
  shopName: string;
  ownerName: string;
  phone: string;
  location: string;
  panNumber?: string;
  lat?: number;
  lng?: number;
  isActive?: boolean;
  isAdmin?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AdminStats {
  totalPharmacies: number;
  totalMedicines: number;
  availableMedicines: number;
  outOfStockMedicines: number;
  totalReports: number;
}
