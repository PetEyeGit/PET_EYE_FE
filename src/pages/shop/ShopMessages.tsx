import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Shield, User, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useShopChat } from '../../hooks/useShopChat';
import { shopService } from '../../services/shop.service';
import { staffService } from '../../services/staff.service';
import { useQuery } from '@tanstack/react-query';
import ConversationThread from '../../components/chat/shared/ConversationThread';

type ChannelType = 'ADMIN_SUPPORT' | 'INTERNAL_STAFF' | 'DIRECT' | 'CUSTOMER_CHAT';

export default function ShopMessages() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState<{
    type: ChannelType;
    id: string | number; // For DIRECT, this is staff email
    title: string;
  }>({ type: 'ADMIN_SUPPORT', id: 'admin', title: 'Hệ thống Admin' });

  const { data: myShop } = useQuery({
    queryKey: ['my-shop'],
    queryFn: () => shopService.getMyShop()
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ['my-shop-staff'],
    queryFn: () => staffService.getMyShopStaff(),
    enabled: !!myShop
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['my-shop-customers', myShop?.id],
    queryFn: () => shopService.getShopCustomers(myShop!.id),
    enabled: !!myShop
  });

  const { messages, connected, sendMessage } = useShopChat(
    myShop?.id ?? null,
    user?.token,
    activeChannel.type,
    (activeChannel.type === 'DIRECT' || activeChannel.type === 'CUSTOMER_CHAT') ? (activeChannel.id as string) : undefined
  );

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.customerEmail) {
      setActiveChannel({
        type: 'CUSTOMER_CHAT',
        id: location.state.customerEmail,
        title: `Khách hàng: ${location.state.customerName || location.state.customerEmail}`
      });
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !connected) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 m-4">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tin nhắn</h1>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm hội thoại..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hệ thống</span>
          </div>
          
          {user?.role === 'SHOP_OWNER' && (
            <button 
              onClick={() => setActiveChannel({ type: 'ADMIN_SUPPORT', id: 'admin', title: 'Hệ thống Admin' })}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                activeChannel.type === 'ADMIN_SUPPORT' 
                ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700' 
                : 'hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <Shield size={20} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Admin Hỗ trợ</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">Chỉ Chủ shop truy cập</p>
              </div>
            </button>
          )}

          <button 
            onClick={() => setActiveChannel({ type: 'INTERNAL_STAFF', id: 'internal', title: 'Nhóm Nội bộ Shop' })}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
              activeChannel.type === 'INTERNAL_STAFF' 
              ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700' 
              : 'hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Users size={20} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Nhóm Nội bộ</p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">Tất cả nhân viên</p>
            </div>
          </button>

          <div className="px-3 pt-4 mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng (Bookings)</span>
          </div>

          {customers.length === 0 ? (
            <div className="px-6 py-4 text-[11px] text-slate-400 italic">Chưa có khách hàng nào</div>
          ) : customers.map(customer => (
            <button 
              key={customer.email}
              onClick={() => setActiveChannel({ 
                type: 'CUSTOMER_CHAT', 
                id: customer.email, 
                title: `Khách hàng: ${customer.fullName}`,
                recipientEmail: customer.email 
              })}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                activeChannel.id === customer.email 
                ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700' 
                : 'hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MessageCircle size={20} className="text-primary" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">{customer.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{customer.email}</p>
              </div>
            </button>
          ))}

          <div className="px-3 pt-4 mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhân viên (1-1)</span>
          </div>

          {staffList.filter(s => s.email !== user?.email).map(staff => (
            <button 
              key={staff.id}
              onClick={() => setActiveChannel({ type: 'DIRECT', id: staff.email!, title: staff.fullName })}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                activeChannel.type === 'DIRECT' && activeChannel.id === staff.email
                ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700' 
                : 'hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                <User size={20} className="text-slate-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{staff.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{staff.specialization || 'Nhân viên'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <ConversationThread 
        containerClassName="flex-1 rounded-r-3xl"
        messages={messages}
        currentUserEmail={user?.email}
        connected={connected}
        input={input}
        setInput={setInput}
        onSendMessage={(msg) => sendMessage(msg)}
        headerInfo={{
            title: activeChannel.title,
            icon: activeChannel.type === 'ADMIN_SUPPORT' ? <Shield size={24} className="text-blue-600" /> :
                  activeChannel.type === 'INTERNAL_STAFF' ? <Users size={24} className="text-emerald-500" /> : 
                  activeChannel.type === 'CUSTOMER_CHAT' ? <MessageCircle size={24} className="text-primary" /> :
                  <User size={24} className="text-slate-500" />
        }}
      />
    </div>
  );
}
