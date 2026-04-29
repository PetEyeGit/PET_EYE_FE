import apiClient from './apiClient';
import type { ApiResponse, ServiceResponse } from '../types/api';

export interface ShopPublicResponse {
  id: number;
  shopName: string;
  shopType: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  description: string;
  licenseImageUrl: string;
  isVerified: boolean;
  ratingAvg: number;
  ownerId: number;
}

export interface ShopRegistrationRequest {
  shopName: string;
  shopType: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  description: string;
  password: string;
  licenseNumber: string;
  licenseImageUrl?: string;
}

export const shopService = {
  register: async (data: ShopRegistrationRequest) => {
    const response = await apiClient.post('/shops/register', data);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get('/shops');
    return response.data;
  },

  approve: async (id: number) => {
    const response = await apiClient.post(`/shops/approve/${id}`);
    return response.data;
  },

  // ─── Public endpoints (no auth required) ──────────────────────────────────

  /** Search verified shops. All params optional. */
  searchPublic: async (params?: {
    keyword?: string;
    city?: string;
    shopType?: string;
  }): Promise<ShopPublicResponse[]> => {
    const response = await apiClient.get<ApiResponse<ShopPublicResponse[]>>('/shops/public', { params });
    return response.data.result ?? [];
  },

  /** Get a single verified shop by id. */
  getPublicById: async (id: number): Promise<ShopPublicResponse> => {
    const response = await apiClient.get<ApiResponse<ShopPublicResponse>>(`/shops/public/${id}`);
    return response.data.result!;
  },

  /** Get active services for a shop (public). */
  getShopServices: async (shopId: number): Promise<ServiceResponse[]> => {
    const response = await apiClient.get<ApiResponse<ServiceResponse[]>>(`/services/shop/${shopId}`);
    return response.data.result ?? [];
  },
};
