export interface Pharmacy {
  shopName: string;
  phone: string;
  location: string;
}

export interface Medicine {
  _id: string;
  medicineName: string;
  category: string;
  status: 'Available' | 'Out_of_Stock';
  reportCount: number;
  lastUpdated: string | Date;
  pharmacy: Pharmacy | null;
}

export interface User {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  location: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
