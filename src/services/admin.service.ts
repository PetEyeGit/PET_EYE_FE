import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalRevenue: number;
  totalUsers: number;
  totalShops: number;
  totalBookings: number;
  pendingShops: number;
  unreadMessages: number;
}

export interface AdminShopResponse {
  id: number;
  shopName: string;
  shopType: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  description: string;
  licenseNumber: string;
  licenseImageUrl?: string;
  isVerified: boolean;
  ratingAvg: number;
  ownerId: number;
}

export interface AdminStaffResponse {
  id: number;
  shopId: number;
  userId: number;
  email: string;
  fullName: string;
  role: string;
  phone: string;
  specialization: string;
  isActive: boolean;
}

export interface AdminUserResponse {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  avatar?: string;
  roles: { name: string }[];
  isActive?: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AdminNotification {
  broadcastId: string;
  title: string;
  content: string;
  totalSent: number;
  totalRead: number;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  shopId: number;
  senderEmail: string;
  senderRole: string;
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;  // IMAGE | FILE | VIDEO
  attachmentName?: string;
  createdAt: string;
  isRead: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const adminService = {
  // Dashboard
  getDashboard: async (): Promise<AdminDashboardStats> => {
    const res = await apiClient.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard');
    return res.data.result!;
  },

  // Shops
  getAllShops: async (): Promise<AdminShopResponse[]> => {
    const res = await apiClient.get<ApiResponse<AdminShopResponse[]>>('/shops');
    return res.data.result ?? [];
  },

  getPendingShops: async (): Promise<AdminShopResponse[]> => {
    const res = await apiClient.get<ApiResponse<AdminShopResponse[]>>('/shops/pending');
    return res.data.result ?? [];
  },

  getShopById: async (id: number): Promise<AdminShopResponse> => {
    const res = await apiClient.get<ApiResponse<AdminShopResponse>>(`/shops/${id}`);
    return res.data.result!;
  },

  approveShop: async (id: number): Promise<void> => {
    await apiClient.post(`/shops/approve/${id}`);
  },

  rejectShop: async (id: number): Promise<void> => {
    await apiClient.post(`/shops/reject/${id}`);
  },

  getShopStaff: async (shopId: number): Promise<AdminStaffResponse[]> => {
    const res = await apiClient.get<ApiResponse<AdminStaffResponse[]>>(`/shops/${shopId}/staff`);
    return res.data.result ?? [];
  },

  // Users
  getAllUsers: async (): Promise<AdminUserResponse[]> => {
    const res = await apiClient.get<ApiResponse<AdminUserResponse[]>>('/users');
    return res.data.result ?? [];
  },

  deactivateUser: async (id: number): Promise<void> => {
    await apiClient.patch(`/users/${id}/deactivate`);
  },

  activateUser: async (id: number): Promise<void> => {
    await apiClient.patch(`/users/${id}/activate`);
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Notifications
  getNotifications: async (page = 0): Promise<PagedResponse<AdminNotification>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<AdminNotification>>>('/admin/notifications', { params: { page } });
    return res.data.result!;
  },

  createNotification: async (data: {
    title: string;
    content: string;
    targetType: 'SINGLE' | 'ALL_USERS' | 'ALL_SHOPS' | 'ALL';
    userId?: number;
  }): Promise<string> => {
    const res = await apiClient.post<ApiResponse<null> & { message: string }>('/admin/notifications', data);
    return res.data.message ?? 'Đã gửi thông báo';
  },

  deleteNotification: async (broadcastId: string): Promise<void> => {
    await apiClient.delete(`/admin/notifications/${broadcastId}`);
  },

  // Chat
  getChatHistory: async (shopId: number, channelType: string = 'ADMIN_SUPPORT'): Promise<ChatMessage[]> => {
    const res = await apiClient.get<ApiResponse<ChatMessage[]>>(`/chat/${shopId}/history`, {
      params: { channelType }
    });
    return res.data.result ?? [];
  },

  markChatRead: async (shopId: number, channelType: string = 'ADMIN_SUPPORT'): Promise<void> => {
    await apiClient.patch(`/chat/${shopId}/read`, null, {
      params: { channelType }
    });
  },
};
