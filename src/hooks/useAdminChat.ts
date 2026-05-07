import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { adminService, ChatMessage } from '../services/admin.service';

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '/api/ws');

export function useAdminChat(shopId: number | null, token: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  const channelType = 'ADMIN_SUPPORT';

  // Load history when shopId changes
  useEffect(() => {
    if (!shopId) return;
    setMessages([]);
    adminService.getChatHistory(shopId, channelType).then(setMessages).catch(() => {});
    adminService.markChatRead(shopId, channelType).catch(() => {});
  }, [shopId]);

  // WebSocket connection
  useEffect(() => {
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [token]);

  // Subscribe to shopId room with channelType
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !connected || !shopId) return;

    const topic = `/topic/chat/${shopId}/${channelType}`;
    console.log('Admin subscribing to:', topic);

    const sub = client.subscribe(topic, (frame) => {
      try {
        const msg: ChatMessage = JSON.parse(frame.body);
        setMessages(prev => [...prev, msg]);
      } catch (err) {
        console.error('Admin parse error:', err);
      }
    });

    return () => sub.unsubscribe();
  }, [connected, shopId]);

  const sendMessage = useCallback((targetShopId: number, content: string) => {
    const client = clientRef.current;
    if (!client || !connected) return;
    client.publish({
      destination: '/app/chat',
      body: JSON.stringify({ 
        shopId: targetShopId, 
        channelType,
        content 
      }),
    });
  }, [connected]);

  return { messages, connected, sendMessage };
}
