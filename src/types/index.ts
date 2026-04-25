export type UserRole = 'ADMIN' | 'USER' | 'SHOP_OWNER';

export interface User {
  id?: string | number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  token?: string;
}

export interface Clinic {
  id: number;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  hours: string;
  distance: string;
  price: string;
  tags: string[];
  image: string;
  verified: boolean;
  badge?: string | null;
}

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  weight: number;
  dob: string;
  healthNote: string;
  ownerFullName?: string;
  isActive: boolean;
  unactiveReason?: string;
  documents?: PetDocument[];
}

export interface PetDocument {
  id: number;
  documentType: string;
  fileUrl: string;
  uploadDate: string;
  description?: string;
}
