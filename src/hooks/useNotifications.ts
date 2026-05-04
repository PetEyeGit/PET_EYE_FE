import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import type { ApiResponse } from '../types/api';

export interface AppNotification {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// Load tất cả thông báo (page 0, size lớn)
async function fetchAllMyNotifications(): Promise<AppNotification[]> {
  const res = await apiClient.get<ApiResponse<any>>('/users/notifications/my', {
    params: { page: 0, size: 50 }
  });
  const result = res.data.result;
  if (Array.isArray(result)) return result;
  return result?.content ?? [];
}

async function callMarkRead(id: number): Promise<void> {
  await apiClient.patch(`/users/notifications/${id}/read`);
}

export function useNotifications(enabled = true) {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: fetchAllMyNotifications,
    enabled,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: callMarkRead,
    onMutate: async (id) => {
      // Optimistic update ngay lập tức
      await qc.cancelQueries({ queryKey: ['my-notifications'] });
      const prev = qc.getQueryData<AppNotification[]>(['my-notifications']);
      qc.setQueryData<AppNotification[]>(['my-notifications'],
        old => (old ?? []).map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      // Rollback nếu lỗi
      if (ctx?.prev) qc.setQueryData(['my-notifications'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });

  return { notifications, unreadCount, isLoading, refetch, markRead: markReadMutation.mutate };
}
