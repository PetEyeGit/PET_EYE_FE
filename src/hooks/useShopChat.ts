import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import apiClient from '../services/apiClient';
import type { ApiResponse } from '../types/api';
import type { ChatMessage } from '../services/admin.service';

const WS_URL = 'http://localhost:8080/api/ws';

export function useShopChat(shopId: number | null, token: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  // Load history
  useEffect(() => {
    if (!shopId) return;
    setMessages([]);
    apiClient.get<ApiResponse<ChatMessage[]>>(`/chat/${shopId}/history`)
      .then(r => setMessages(r.data.result ?? []))
      .catch(() => {});
    apiClient.patch(`/chat/${shopId}/read`).catch(() => {});
  }, [shopId]);

  // WebSocket
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
    return () => { client.deactivate(); };
  }, [token]);

  // Subscribe
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !connected || !shopId) return;
    const sub = client.subscribe(`/topic/chat/${shopId}`, (frame) => {
      try {
        const msg: ChatMessage = JSON.parse(frame.body);
        setMessages(prev => [...prev, msg]);
      } catch {}
    });
    return () => sub.unsubscribe();
  }, [connected, shopId]);

  const sendMessage = useCallback((content: string) => {
    const client = clientRef.current;
    if (!client || !connected || !shopId) return;
    client.publish({
      destination: '/app/chat',
      body: JSON.stringify({ shopId, content }),
    });
  }, [connected, shopId]);

  return { messages, connected, sendMessage };
}
