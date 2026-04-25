import apiClient from './apiClient';
import { ApiResponse } from '../types/api';
import { Pet } from '../types';

export const petService = {
  create: async (petData: any): Promise<Pet> => {
    const response = await apiClient.post<ApiResponse<Pet>>('/pets', petData);
    return response.data.result!;
  },

  getByOwner: async (ownerId: number): Promise<Pet[]> => {
    const response = await apiClient.get<ApiResponse<Pet[]>>(`/pets/owner/${ownerId}`);
    return response.data.result!;
  },

  getById: async (id: number): Promise<Pet> => {
    const response = await apiClient.get<ApiResponse<Pet>>(`/pets/${id}`);
    return response.data.result!;
  },

  delete: async (id: number, reason: string): Promise<void> => {
    await apiClient.delete(`/pets/${id}`, { params: { reason } });
  }
};
