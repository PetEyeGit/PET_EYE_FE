export interface ApiResponse<T> {
  code: number;
  message?: string;
  result?: T;
}

export interface AuthenticationResponse {
  authenticated: boolean;
  token: string;
  requiresEmailUpdate: boolean;
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
  /** Tier IDs the shop supports, e.g. ["BASIC","HD","AI"] */
  cameraTiers?: string[];
  /** Custom prices per tier (extra VND/day), e.g. {"BASIC":0,"HD":60000} */
  cameraTierPrices?: Record<string, number>;
  /** Custom display labels per tier, e.g. {"BASIC":"Tiêu chuẩn","HD":"Nét cao"} */
  cameraTierLabels?: Record<string, string>;
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
  cameraTierPrices?: Record<string, number>;
  cameraTierLabels?: Record<string, string>;
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
  cameraTierPrices?: Record<string, number>;
  cameraTierLabels?: Record<string, string>;
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
  /** true = rảnh tại khung giờ được query, false = bận, undefined = chưa query */
  available?: boolean;
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

export interface CustomerItemResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  pets: number;
  totalBookings: number;
  totalSpent: string;
  lastVisit: string;
  tier: string;
}

export interface ShopCustomerResponse {
  totalCustomers: number;
  newCustomersThisMonth: number;
  loyalCustomers: number;
  customers: CustomerItemResponse[];
}

export interface PetResponse {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  birthDate: string;
  weight: number;
  avatar: string;
  ownerId: number;
}

export interface CustomerDetailResponse {
  customerInfo: CustomerItemResponse;
  pets: PetResponse[];
  bookingHistory: BookingResponse[];
}

export interface RevenueChartData {
  date: string;
  amount: number;
}

export interface ServiceStat {
  name: string;
  count: number;
}

export interface ShopDashboardResponse {
  totalRevenue: number;
  revenueThisMonth: number;
  totalBookings: number;
  pendingBookings: number;
  totalCustomers: number;
  totalPets: number;
  revenueChart: RevenueChartData[];
  topServices: ServiceStat[];
}
