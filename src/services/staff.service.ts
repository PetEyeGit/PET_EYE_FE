import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StaffResponse {
  id: number;
  shopId: number;
  userId: number | null;
  email: string | null;
  fullName: string;
  role: string | null;
  phone: string | null;
  specialization: string | null;
  isActive: boolean;
}

export interface StaffCreationRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  specialization?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const staffService = {
  /** GET /staff — Owner: get all staff in owner's shop */
  getMyShopStaff: async (): Promise<StaffResponse[]> => {
    const response = await apiClient.get<ApiResponse<StaffResponse[]>>('/staff');
    return response.data.result ?? [];
  },

  /** GET /staff/:id — Owner: get a single staff member */
  getStaffById: async (id: number): Promise<StaffResponse> => {
    const response = await apiClient.get<ApiResponse<StaffResponse>>(`/staff/${id}`);
    return response.data.result!;
  },

  /** POST /staff — Owner: create a new staff account */
  createStaff: async (data: StaffCreationRequest): Promise<StaffResponse> => {
    const response = await apiClient.post<ApiResponse<StaffResponse>>('/staff', data);
    return response.data.result!;
  },

  /** PUT /staff/:id/toggle-status — Owner: toggle active/inactive */
  toggleStatus: async (id: number): Promise<StaffResponse> => {
    const response = await apiClient.put<ApiResponse<StaffResponse>>(
      `/staff/${id}/toggle-status`
    );
    return response.data.result!;
  },

  /** PUT /staff/:id — Owner: update staff details */
  updateStaff: async (id: number, data: Partial<StaffCreationRequest>): Promise<StaffResponse> => {
    const response = await apiClient.put<ApiResponse<StaffResponse>>(`/staff/${id}`, data);
    return response.data.result!;
  },
};
