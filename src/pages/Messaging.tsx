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

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 transition-all ${selectedShop ? 'hidden md:flex' : 'flex'}`}>
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

        <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-10">
          {chatShops.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm italic">Bạn chưa có cuộc trò chuyện nào</div>
          ) : chatShops.map((shop) => (
            <button 
              key={shop.id}
              type="button"
              onClick={() => setSelectedShop(shop)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative ${
                selectedShop?.id === shop.id 
                  ? 'bg-primary/10 border border-primary/20 shadow-sm' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                selectedShop?.id === shop.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
              }`}>
                <MessageCircle size={24} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h4 className={`font-bold text-sm truncate ${selectedShop?.id === shop.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                  {shop.name}
                </h4>
                <p className="text-xs text-slate-500 truncate">Nhấn để nhắn tin với shop</p>
              </div>
              {selectedShop?.id === shop.id && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 transition-all ${!selectedShop ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {selectedShop ? (
            <ConversationThread
                messages={messages}
                currentUserEmail={user?.email}
                connected={connected}
                input={input}
                setInput={setInput}
                onSendMessage={(msg, attachment) => sendMessage(msg, attachment)}
                headerInfo={{
                    title: selectedShop.name,
                    icon: <MessageCircle size={20} className="text-primary" />
                }}
                onBack={() => setSelectedShop(null)}
            />
        ) : (
          <div className="text-center p-8 max-w-sm">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-800">
              <MessageCircle size={40} className="text-primary/20" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Trung tâm tin nhắn</h3>
            <p className="text-sm text-slate-500">Chọn một cửa hàng từ danh sách bên trái để bắt đầu trao đổi hoặc xem lại lịch sử tư vấn.</p>
          </div>
        )}
      </main>
    </div>
  );
}
