import React, { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  shopId: number;
}

const WS_URL = 'http://localhost:8080/api/ws';

export default function ShopRealtimeNotification({ shopId }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shopId || !user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      debug: (str) => {
        // console.log('STOMP Notif:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/shop/${shopId}/notifications`, (message) => {
        try {
          const data = JSON.parse(message.body);
          if (data.message === 'Có đơn hàng mới!') {
            // Phát âm thanh
            const audio = new Audio('/assets/sounds/notification.wav');
            audio.play().catch(e => console.warn('Không thể phát âm thanh tự động (Auto-play policy):', e));
            
            // Hiển thị toast nhắc nhở
            toast.success('🔔 Shop vừa có đơn hàng mới!');
            
            // Invalidate query để cập nhật số lượng thông báo / danh sách đơn hàng
            queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
            queryClient.invalidateQueries({ queryKey: ['allShopTasks'] });
          }
        } catch (e) {
          console.error('Error parsing notification', e);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP Notif error', frame.headers['message']);
    };

    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [shopId, user, queryClient]);

  return null; // Component này chỉ chạy ngầm
}
