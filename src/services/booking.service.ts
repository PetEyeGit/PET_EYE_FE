import apiClient from './apiClient';
import type { ApiResponse, BookingRequest, BookingResponse, StaffResponse } from '../types/api';

export interface InitiatePaymentResponse {
  orderCode: number;
  checkoutUrl: string;
  qrCode?: string;
  amount: number;
  description: string;
}

export const bookingService = {
  /** Step 1 (PayOS): validate + create PayOS link. No booking saved yet. */
  initiatePayment: async (data: {
    shopId: number;
    serviceId: number;
    petId: number;
    staffId?: number;
    appointmentDatetime: string;
    note?: string;
  }): Promise<InitiatePaymentResponse> => {
    const response = await apiClient.post<ApiResponse<InitiatePaymentResponse>>(
      '/bookings/initiate-payment', data
    );
    return response.data.result!;
  },

  /** Step 2 (PayOS): verify payment → create booking if PAID */
  confirmPayment: async (orderCode: number): Promise<BookingResponse> => {
    const response = await apiClient.post<ApiResponse<BookingResponse>>(
      `/bookings/confirm-payment?orderCode=${orderCode}`
    );
    return response.data.result!;
  },

  /** Cash Step 1: validate + create PayOS link for 10% deposit. No booking saved yet. */
  initiateCashDeposit: async (data: BookingRequest): Promise<InitiatePaymentResponse> => {
    const response = await apiClient.post<ApiResponse<InitiatePaymentResponse>>(
      '/bookings/cash/initiate', data
    );
    return response.data.result!;
  },

  /** Cash Step 2: verify 10% deposit paid → create booking */
  confirmCashDeposit: async (orderCode: number): Promise<BookingResponse> => {
    const response = await apiClient.post<ApiResponse<BookingResponse>>(
      `/bookings/cash/confirm?orderCode=${orderCode}`
    );
    return response.data.result!;
  },

  /** Get all bookings of the current user */
  getMyBookings: async (): Promise<BookingResponse[]> => {
    const response = await apiClient.get<ApiResponse<BookingResponse[]>>('/bookings/my');
    return response.data.result ?? [];
  },

  /** Get booking detail */
  getById: async (id: number): Promise<BookingResponse> => {
    const response = await apiClient.get<ApiResponse<BookingResponse>>(`/bookings/${id}`);
    return response.data.result!;
  },

  /** Cancel a booking */
  cancel: async (id: number): Promise<BookingResponse> => {
    const response = await apiClient.post<ApiResponse<BookingResponse>>(`/bookings/${id}/cancel`);
    return response.data.result!;
  },

  /** Get active staff for a shop */
  getShopStaff: async (shopId: number): Promise<StaffResponse[]> => {
    const response = await apiClient.get<ApiResponse<StaffResponse[]>>(`/bookings/staff/${shopId}`);
    return response.data.result ?? [];
  },

  /** Get staff with availability for a specific time slot */
  getShopStaffAvailability: async (
    shopId: number,
    appointmentDatetime: string,
    durationMinutes: number = 60
  ): Promise<StaffResponse[]> => {
    const response = await apiClient.get<ApiResponse<StaffResponse[]>>(
      `/bookings/staff/${shopId}/availability`,
      { params: { appointmentDatetime, durationMinutes } }
    );
    return response.data.result ?? [];
  },

  /** Get all bookings for the authenticated shop owner within a range */
  getShopBookings: async (start?: string, end?: string): Promise<BookingResponse[]> => {
    const params: any = {};
    if (start) params.start = start;
    if (end) params.end = end;
    
    const response = await apiClient.get<ApiResponse<BookingResponse[]>>('/bookings/shop', { params });
    return response.data.result ?? [];
  },
};
