import apiClient from './apiClient';
import { ApiResponse, AuthenticationResponse } from '../types/api';
import { User, UserRole } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>('/auth/login', {
      email,
      password,
    });

    const { token, authenticated, requiresEmailUpdate } = response.data.result!;

    if (!authenticated) {
      throw new Error('Authentication failed');
    }

    return authService._decodeAndCreateUser(token, requiresEmailUpdate);
  },

  logout: async (token: string): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', { token });
    } catch (error) {
      console.error('Logout failed on server', error);
    }
  },

  refreshToken: async (token: string): Promise<AuthenticationResponse> => {
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>('/auth/refresh', {
      token,
    });
    return response.data.result!;
  },

  loginWithGoogle: async (token: string): Promise<User> => {
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>('/auth/google', {
      token,
    });
    const { token: jwtToken, authenticated, requiresEmailUpdate } = response.data.result!;
    if (!authenticated) throw new Error('Authentication failed');
    return authService._decodeAndCreateUser(jwtToken, requiresEmailUpdate);
  },

  loginWithFacebook: async (code: string): Promise<User> => {
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>('/auth/facebook', {
      code,
    });
    const { token: jwtToken, authenticated, requiresEmailUpdate } = response.data.result!;
    if (!authenticated) throw new Error('Authentication failed');
    return authService._decodeAndCreateUser(jwtToken, requiresEmailUpdate);
  },

  loginWithZalo: async (code: string): Promise<User> => {
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>('/auth/zalo', {
      code,
    });
    const { token: jwtToken, authenticated, requiresEmailUpdate } = response.data.result!;
    if (!authenticated) throw new Error('Authentication failed');
    return authService._decodeAndCreateUser(jwtToken, requiresEmailUpdate);
  },

  verifyEmail: async (email: string, otp: string): Promise<void> => {
    await apiClient.post('/auth/verify-email', null, { params: { email, otp } });
  },

  resendVerification: async (email: string): Promise<void> => {
    await apiClient.post('/auth/resend-verification', null, { params: { email } });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (email: string, otp: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { email, otp, newPassword });
  },

  updateEmail: async (email: string): Promise<User> => {
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>('/auth/update-email', {
      email,
    });
    const { token, authenticated } = response.data.result!;
    if (!authenticated) throw new Error('Failed to update email');
    return authService._decodeAndCreateUser(token);
  },

  _decodeAndCreateUser: (token: string, requiresEmailUpdate?: boolean): User => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.email.split('@')[0], 
      role: (payload.roles && payload.roles.length > 0) ? payload.roles[0] as UserRole : 'USER',
      token,
      requiresEmailUpdate,
    };
  }
};
