import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Image, Paperclip, Smile, MoreVertical, Phone, Video, MessageCircle, ChevronLeft, Users } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useShopChat } from '../hooks/useShopChat';
import { bookingService } from '../services/booking.service';
import { useQuery } from '@tanstack/react-query';
import ConversationThread from '../components/chat/shared/ConversationThread';

export default function Messaging() {
  const { user } = useAuth();
  const [selectedShop, setSelectedShop] = useState<{ id: number; name: string; avatar?: string } | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch unique shops from booking history
  const { data: bookings = [] } = useQuery({
    queryKey: ['my-bookings-chat', user?.id],
    queryFn: () => bookingService.getMyBookings(),
    enabled: !!user
  });

  // Extract unique shops
  const chatShops = Array.from(new Map(
    bookings.map(b => [b.shopId, { id: b.shopId, name: b.shopName }])
  ).values());

  const { messages, connected, sendMessage } = useShopChat(
    selectedShop?.id ?? null,
    user?.token,
    'CUSTOMER_CHAT',
    user?.email // recipientEmail for customer chat is the customer's own email
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !connected) return;
    sendMessage(input);
    setInput('');
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 ${selectedShop ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Tin nhắn</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Tìm kiếm shop..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {chatShops.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">Bạn chưa có cuộc trò chuyện nào</div>
          ) : chatShops.map((shop) => (
            <button 
              key={shop.id}
              onClick={() => setSelectedShop(shop)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                selectedShop?.id === shop.id ? 'bg-primary/5 border border-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MessageCircle size={24} className="text-primary" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{shop.name}</h4>
                <p className="text-xs text-slate-500 truncate">Nhấn để nhắn tin với shop</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 ${!selectedShop ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {selectedShop ? (
            <ConversationThread
                messages={messages}
                currentUserEmail={user?.email}
                connected={connected}
                input={input}
                setInput={setInput}
                onSendMessage={(msg) => sendMessage(msg)}
                headerInfo={{
                    title: selectedShop.name,
                    icon: <MessageCircle size={20} className="text-primary" />
                }}
                onBack={() => setSelectedShop(null)}
            />
        ) : (
          <div className="text-center text-slate-400">
            <MessageCircle size={60} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-medium">Chọn một shop để bắt đầu trao đổi</p>
          </div>
        )}
      </main>
    </div>
  );
}
