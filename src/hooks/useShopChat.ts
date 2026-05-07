import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import type { ApiResponse } from '../types/api';
import type { ChatMessage } from '../services/admin.service';

const WS_URL = 'http://localhost:8080/api/ws';

export function useShopChat(
  shopId: number | null, 
  token: string | undefined, 
  channelType: string = 'ADMIN_SUPPORT',
  recipientEmail?: string
) {
  const { user } = useAuth();
  const currentEmail = user?.email;
  const userRole = user?.role;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    console.log(`useShopChat [${channelType}] initialized. ShopId:`, shopId, "Role:", userRole);
  }, [shopId, channelType, !!token, userRole]);

  // Load history
  useEffect(() => {
    if (!shopId) return;
    setMessages([]);
    apiClient.get<ApiResponse<ChatMessage[]>>(`/chat/${shopId}/history`, {
      params: { channelType, recipientEmail }
    })
      .then(r => setMessages(r.data.result ?? []))
      .catch(() => {});
    apiClient.patch(`/chat/${shopId}/read`, null, {
      params: { channelType, recipientEmail }
    }).catch(() => {});
  }, [shopId, channelType, recipientEmail]);

  // WebSocket
  useEffect(() => {
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        setConnected(true);
      },
      onDisconnect: () => setConnected(false),
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [token]);

  // Subscribe
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !connected || !shopId) return;

    let topic = `/topic/chat/${shopId}/${channelType}`;
    
    if (channelType === 'CUSTOMER_CHAT') {
      topic = `/topic/chat/${shopId}/customer/${recipientEmail}`;
    } else if (channelType === 'DIRECT') {
      // 1-1 chat. Identifier is the staff's email.
      const staffEmail = userRole === 'SHOP_OWNER' ? recipientEmail : currentEmail;
      topic = `/topic/chat/${shopId}/direct/${staffEmail}`;
    }
      
    console.log('Subscribing to:', topic);
    
    const sub = client.subscribe(topic, (frame) => {
      try {
        const msg: ChatMessage = JSON.parse(frame.body);
        setMessages(prev => [...prev, msg]);
      } catch (err) {
        console.error('Error parsing msg:', err);
      }
    });

    return () => sub.unsubscribe();
  }, [connected, shopId, channelType, recipientEmail, currentEmail, userRole]);

  const sendMessage = useCallback((content: string) => {
    const client = clientRef.current;
    if (!client || !connected || !shopId) return;

    client.publish({
      destination: '/app/chat',
      body: JSON.stringify({ 
        shopId, 
        channelType,
        recipientEmail,
        content 
      }),
    });
  }, [connected, shopId, channelType, recipientEmail]);

  return { messages, connected, sendMessage };
}
