import apiClient from './apiClient';
import { ApiResponse, AuthenticationResponse } from '../types/api';
import { User, UserRole } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>('/auth/login', {
      email,
      password,
    });

    const { token, authenticated } = response.data.result!;

    if (!authenticated) {
      throw new Error('Authentication failed');
    }

    // Decode JWT payload to get user info
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // The BE adds "email" and "roles" claims
    const user: User = {
      id: payload.sub,
      email: payload.email,
      name: payload.email.split('@')[0], 
      role: (payload.roles && payload.roles.length > 0) ? payload.roles[0] as UserRole : 'USER',
      token,
    };

    return user;
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
  }
};
