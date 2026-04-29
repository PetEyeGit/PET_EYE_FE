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

  /** Cash: create booking immediately */
  createCashBooking: async (data: BookingRequest): Promise<BookingResponse> => {
    const response = await apiClient.post<ApiResponse<BookingResponse>>('/bookings/cash', data);
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
};
