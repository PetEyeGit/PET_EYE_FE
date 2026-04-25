import apiClient from './apiClient';

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
  }
};
