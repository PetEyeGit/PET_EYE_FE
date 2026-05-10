/**
 * Shared AI chat history service cho cả Shop AI và Admin AI.
 * baseUrl: '/shop-ai' hoặc '/admin-ai'
 */
import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';

export interface AIChatRecord {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

function makeService(baseUrl: string) {
  return {
    getHistory: async (): Promise<AIChatRecord[]> => {
      const res = await apiClient.get<ApiResponse<AIChatRecord[]>>(`${baseUrl}/history`);
      return res.data.result ?? [];
    },

    saveMessage: async (role: 'user' | 'assistant', content: string): Promise<AIChatRecord> => {
      const res = await apiClient.post<ApiResponse<AIChatRecord>>(`${baseUrl}/history`, { role, content });
      return res.data.result!;
    },

    saveMessages: async (msgs: { role: 'user' | 'assistant'; content: string }[]): Promise<AIChatRecord[]> => {
      if (!msgs.length) return [];
      const res = await apiClient.post<ApiResponse<AIChatRecord[]>>(`${baseUrl}/history/batch`, msgs);
      return res.data.result ?? [];
    },

    clearHistory: async (): Promise<void> => {
      await apiClient.delete(`${baseUrl}/history`);
    },
  };
}

export const shopAIChatService = makeService('/shop-ai');
export const adminAIChatService = makeService('/admin-ai');
