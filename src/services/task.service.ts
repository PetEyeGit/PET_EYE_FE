import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TaskResponse {
  bookingId: number;
  shopId: number;
  shopName: string;
  petId: number;
  petName: string;
  customerId: number;
  customerName: string;
  serviceId: number;
  serviceName: string;
  staffId: number | null;
  staffName: string | null;
  appointmentDatetime: string;
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PENDING_PAYMENT';
  note: string | null;
  createdAt: string;
}

export type TaskStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// ─── Service ──────────────────────────────────────────────────────────────────

export const taskService = {
  // ─── Staff endpoints ──────────────────────────────────────────────────────

  /** GET /tasks/my-tasks — Staff: get assigned tasks */
  getMyTasks: async (): Promise<TaskResponse[]> => {
    const response = await apiClient.get<ApiResponse<TaskResponse[]>>('/tasks/my-tasks');
    return response.data.result ?? [];
  },

  /** GET /tasks/unassigned — Staff/Owner: get unassigned bookings in shop */
  getUnassignedTasks: async (): Promise<TaskResponse[]> => {
    const response = await apiClient.get<ApiResponse<TaskResponse[]>>('/tasks/unassigned');
    return response.data.result ?? [];
  },

  /** PUT /tasks/:id/claim — Staff: claim an unassigned booking */
  claimTask: async (bookingId: number): Promise<TaskResponse> => {
    const response = await apiClient.put<ApiResponse<TaskResponse>>(
      `/tasks/${bookingId}/claim`
    );
    return response.data.result!;
  },

  /** PUT /tasks/:id/status — Staff: update task status */
  updateStatus: async (bookingId: number, status: TaskStatus): Promise<TaskResponse> => {
    const response = await apiClient.put<ApiResponse<TaskResponse>>(
      `/tasks/${bookingId}/status`,
      { status }
    );
    return response.data.result!;
  },

  // ─── Owner endpoints ──────────────────────────────────────────────────────

  /** GET /tasks/all — Owner: get all shop bookings */
  getAllShopTasks: async (): Promise<TaskResponse[]> => {
    const response = await apiClient.get<ApiResponse<TaskResponse[]>>('/tasks/all');
    return response.data.result ?? [];
  },

  /** PUT /tasks/:bookingId/assign/:staffId — Owner: assign staff to booking */
  assignTask: async (bookingId: number, staffId: number): Promise<TaskResponse> => {
    const response = await apiClient.put<ApiResponse<TaskResponse>>(
      `/tasks/${bookingId}/assign/${staffId}`
    );
    return response.data.result!;
  },

  /** PUT /tasks/:bookingId/unassign — Owner: remove staff from booking */
  unassignTask: async (bookingId: number): Promise<TaskResponse> => {
    const response = await apiClient.put<ApiResponse<TaskResponse>>(
      `/tasks/${bookingId}/unassign`
    );
    return response.data.result!;
  },
};
