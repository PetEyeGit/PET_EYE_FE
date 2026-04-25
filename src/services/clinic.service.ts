import apiClient from './apiClient';
import { Clinic } from '../types';
import { ApiResponse } from '../types/api';

export const clinicService = {
  getAll: async (): Promise<Clinic[]> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/shops');
      const shops = response.data.result!;
      
      // Map BE Shop to FE Clinic
      return shops.map(shop => ({
        id: shop.id,
        name: shop.shopName,
        address: shop.address + (shop.city ? `, ${shop.city}` : ''),
        rating: shop.ratingAvg || 0,
        reviewCount: 0, // Not in BE yet
        isOpen: true,
        hours: '08:00 - 20:00',
        distance: '---',
        price: '---',
        tags: [],
        image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
        verified: shop.isVerified,
        badge: shop.isVerified ? 'Verified' : null,
      }));
    } catch (error) {
      console.error('Failed to fetch shops', error);
      return [];
    }
  },

  getById: async (id: number): Promise<Clinic> => {
    const response = await apiClient.get<ApiResponse<any>>(`/shops/${id}`);
    const shop = response.data.result!;
    
    return {
      id: shop.id,
      name: shop.shopName,
      address: shop.address + (shop.city ? `, ${shop.city}` : ''),
      rating: shop.ratingAvg || 0,
      reviewCount: 0,
      isOpen: true,
      hours: '08:00 - 20:00',
      distance: '---',
      price: '---',
      tags: [],
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
      verified: shop.isVerified,
      badge: shop.isVerified ? 'Verified' : null,
    };
  },
};
