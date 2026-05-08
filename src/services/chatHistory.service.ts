import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { ChatMessage, ToolResult } from './chatbot.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatHistoryRecord {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  toolResultJson?: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Chuyển record từ BE → ChatMessage dùng trong UI */
export function recordToMessage(r: ChatHistoryRecord): ChatMessage {
  let toolResult: ToolResult | undefined;
  if (r.toolResultJson) {
    try { toolResult = JSON.parse(r.toolResultJson); } catch { /* ignore */ }
  }
  return {
    id: String(r.id),
    role: r.role,
    content: r.content,
    timestamp: new Date(r.createdAt),
    toolResult,
  };
}

/** Chuyển ChatMessage → payload gửi lên BE */
function messageToPayload(msg: ChatMessage) {
  return {
    role: msg.role,
    content: msg.content,
    toolResultJson: msg.toolResult ? JSON.stringify(msg.toolResult) : undefined,
  };
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const chatHistoryService = {
  /** Lấy toàn bộ lịch sử chat */
  getHistory: async (): Promise<ChatHistoryRecord[]> => {
    const res = await apiClient.get<ApiResponse<ChatHistoryRecord[]>>('/chatbot/history');
    return res.data.result ?? [];
  },

  /** Lưu 1 tin nhắn */
  saveMessage: async (msg: ChatMessage): Promise<ChatHistoryRecord> => {
    const res = await apiClient.post<ApiResponse<ChatHistoryRecord>>(
      '/chatbot/history',
      messageToPayload(msg),
    );
    return res.data.result!;
  },

  /** Lưu nhiều tin nhắn cùng lúc (sync lần đầu) */
  saveMessages: async (msgs: ChatMessage[]): Promise<ChatHistoryRecord[]> => {
    if (!msgs.length) return [];
    const res = await apiClient.post<ApiResponse<ChatHistoryRecord[]>>(
      '/chatbot/history/batch',
      msgs.map(messageToPayload),
    );
    return res.data.result ?? [];
  },

  /** Xoá toàn bộ lịch sử */
  clearHistory: async (): Promise<void> => {
    await apiClient.delete('/chatbot/history');
  },
};
