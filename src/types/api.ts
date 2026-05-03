export interface ApiResponse<T> {
  code: number;
  message?: string;
  result?: T;
}

export interface AuthenticationResponse {
  authenticated: boolean;
  token: string;
}

export interface RoleResponse {
  id: number;
  name: string;
  description: string;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  avatar: string;
  roles: RoleResponse[];
}

export interface ServiceResponse {
  id: number;
  shopId: number;
  shopName: string;
  serviceName: string;
  category: string;
  price: number;
  durationMinutes: number;
  description: string;
  imageUrl: string;
  active: boolean;
  createdAt: string;
  // BOARDING-only
  cameraEnabled: boolean;
  /** Tiers the shop supports, e.g. ["BASIC","HD","AI"] */
  cameraTiers?: string[];
  cameraDescription?: string;
}

export interface ServiceCreationRequest {
  serviceName: string;
  category: string;
  price: number;
  durationMinutes: number;
  description: string;
  imageUrl?: string;
  // BOARDING-only
  cameraEnabled?: boolean;
  cameraTiers?: string[];
  cameraDescription?: string;
}

export interface ServiceUpdateRequest {
  serviceName?: string;
  category?: string;
  price?: number;
  durationMinutes?: number;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  // BOARDING-only
  cameraEnabled?: boolean;
  cameraTiers?: string[];
  cameraDescription?: string;
}

export interface StaffResponse {
  id: number;
  shopId: number;
  fullName: string;
  role: string;
  phone: string;
  specialization: string;
  isActive: boolean;
}

export interface BookingRequest {
  shopId: number;
  serviceId: number;
  petId: number;
  staffId?: number;
  appointmentDatetime: string;
  note?: string;
  paymentMethod?: 'PAYOS' | 'CASH';
}

export interface BookingResponse {
  id: number;
  userId: number;
  shopId: number;
  shopName: string;
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  petId: number;
  petName: string;
  staffId?: number;
  staffName?: string;
  appointmentDatetime: string;
  status: string;
  note?: string;
  payosOrderCode: number;
  createdAt: string;
  checkoutUrl?: string;
  paymentStatus?: string;
}
