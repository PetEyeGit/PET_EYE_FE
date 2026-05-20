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

export interface RevenueMonthly {
  month: number;   // 1-12
  revenue: number; // VND
}

export interface BookingDaily {
  date: string;    // yyyy-MM-dd
  count: number;
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
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
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
  active?: boolean; // field thực tế BE trả về
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type NotificationType = 'GENERAL' | 'PROMOTION' | 'REMINDER' | 'SYSTEM' | 'BOOKING';

export interface AdminNotification {
  broadcastId: string;
  title: string;
  content: string;
  totalSent: number;
  totalRead: number;
  createdAt: string;
  notificationType?: NotificationType;
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

  getRevenueMonthly: async (year?: number): Promise<RevenueMonthly[]> => {
    const res = await apiClient.get<ApiResponse<RevenueMonthly[]>>('/admin/dashboard/revenue-monthly', {
      params: year ? { year } : {}
    });
    return res.data.result ?? [];
  },

  getBookingsWeekly: async (): Promise<BookingDaily[]> => {
    const res = await apiClient.get<ApiResponse<BookingDaily[]>>('/admin/dashboard/bookings-weekly');
    return res.data.result ?? [];
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
    const data = res.data.result ?? [];
    if (data.length > 0) {
      console.log('[DEBUG] raw user[0]:', JSON.stringify(data[0]));
    }
    return data.map(u => ({
      ...u,
      isActive: Boolean((u as any).active ?? u.isActive),
    }));
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
    notificationType?: NotificationType;
    userId?: number;
  }): Promise<string> => {
    const res = await apiClient.post<ApiResponse<null> & { message: string }>('/admin/notifications', data);
    return res.data.message ?? 'Đã gửi thông báo';
  },

  deleteNotification: async (broadcastId: string): Promise<void> => {
    await apiClient.delete(`/admin/notifications/${broadcastId}`);
  },

  // Chat
  getChatHistory: async (shopId: number, channelType: string = 'ADMIN_SUPPORT', recipientEmail?: string): Promise<ChatMessage[]> => {
    const res = await apiClient.get<ApiResponse<ChatMessage[]>>(`/chat/${shopId}/history`, {
      params: { channelType, recipientEmail }
    });
    return res.data.result ?? [];
  },

  markChatRead: async (shopId: number, channelType: string = 'ADMIN_SUPPORT', recipientEmail?: string): Promise<void> => {
    await apiClient.patch(`/chat/${shopId}/read`, null, {
      params: { channelType, recipientEmail }
    });
  },

  getShopCustomers: async (shopId: number): Promise<AdminUserResponse[]> => {
    const res = await apiClient.get<ApiResponse<AdminUserResponse[]>>(`/chat/${shopId}/customers`);
    return res.data.result ?? [];
  },
};
