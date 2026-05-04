import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Shield, Wifi, WifiOff, MessageCircle, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useShopChat } from '../../hooks/useShopChat';
import { shopService } from '../../services/shop.service';
import { useQuery } from '@tanstack/react-query';

// ─── Mock customer conversations (BE chưa có endpoint chat user↔shop) ─────────
interface MockConversation {
  id: string;
  customerName: string;
  customerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  online: boolean;
  petName?: string;
  messages: { id: string; text: string; sender: 'shop' | 'customer'; time: string }[];
}

const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: '1', customerName: 'Nguyễn Văn A',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    lastMessage: 'Bé Miu Miu có ăn uống bình thường không ạ?', lastMessageTime: '10:30', unread: 2, online: true, petName: 'Miu Miu',
    messages: [
      { id: '1', text: 'Xin chào shop, em muốn hỏi về bé Miu Miu ạ', sender: 'customer', time: '10:00' },
      { id: '2', text: 'Chào bạn! Bé Miu Miu đang rất khỏe và vui vẻ ạ', sender: 'shop', time: '10:05' },
      { id: '3', text: 'Bé Miu Miu có ăn uống bình thường không ạ?', sender: 'customer', time: '10:30' },
    ],
  },
  {
    id: '2', customerName: 'Trần Thị B',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    lastMessage: 'Cảm ơn shop đã chăm sóc Buddy rất tốt!', lastMessageTime: '09:15', unread: 0, online: false, petName: 'Buddy',
    messages: [
      { id: '1', text: 'Cảm ơn shop đã chăm sóc Buddy rất tốt!', sender: 'customer', time: '09:15' },
      { id: '2', text: 'Dạ cảm ơn bạn! Buddy rất ngoan ạ', sender: 'shop', time: '09:20' },
    ],
  },
];

type Tab = 'customers' | 'admin';

export default function ShopMessages() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('customers');
  const [selectedConv, setSelectedConv] = useState<MockConversation>(MOCK_CONVERSATIONS[0]);
  const [customerInput, setCustomerInput] = useState('');
  const [adminInput, setAdminInput] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get shop info to get shopId
  const { data: myShop } = useQuery({
    queryKey: ['my-shop'],
    queryFn: shopService.getMyShop,
    enabled: !!user,
  });

  const { messages: adminMessages, connected, sendMessage } = useShopChat(
    myShop?.id ?? null,
    user?.token
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [adminMessages.length, selectedConv.messages.length]);

  const handleSendAdmin = () => {
    if (!adminInput.trim()) return;
    sendMessage(adminInput.trim());
    setAdminInput('');
  };

  const handleSendCustomer = () => {
    if (!customerInput.trim()) return;
    // Mock send
    setCustomerInput('');
  };

  const filteredConvs = MOCK_CONVERSATIONS.filter(c =>
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.petName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-screen-2xl mx-auto px-5 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tin nhắn</h1>
          {tab === 'admin' && (
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
              {connected ? 'Đã kết nối' : 'Chưa kết nối'}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('customers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${tab === 'customers' ? 'bg-[#1a2b4c] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Users size={15} /> Khách hàng
          </button>
          <button onClick={() => setTab('admin')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${tab === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Shield size={15} /> Chat với Admin
          </button>
        </div>

        {/* ── Customer tab ── */}
        {tab === 'customers' && (
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 h-[calc(100vh-260px)]">
            {/* List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm khách hàng..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredConvs.map(conv => (
                  <button key={conv.id} onClick={() => setSelectedConv(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700
                      ${selectedConv.id === conv.id ? 'bg-blue-50 dark:bg-slate-700' : ''}`}>
                    <div className="relative shrink-0">
                      <img src={conv.customerAvatar} className="w-11 h-11 rounded-full object-cover" />
                      {conv.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{conv.customerName}</p>
                        <span className="text-xs text-slate-400 shrink-0 ml-2">{conv.lastMessageTime}</span>
                      </div>
                      {conv.petName && <p className="text-xs text-slate-400 mb-0.5">🐾 {conv.petName}</p>}
                      <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="shrink-0 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">{conv.unread}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={selectedConv.customerAvatar} className="w-10 h-10 rounded-full object-cover" />
                    {selectedConv.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{selectedConv.customerName}</p>
                    {selectedConv.petName && <p className="text-xs text-slate-400">🐾 {selectedConv.petName}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"><Phone size={16} className="text-slate-500" /></button>
                  <button className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"><Video size={16} className="text-slate-500" /></button>
                  <button className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"><MoreVertical size={16} className="text-slate-500" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedConv.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'shop' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                      ${msg.sender === 'shop' ? 'bg-[#1a2b4c] text-white rounded-br-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-sm'}`}>
                      {msg.text}
                      <p className={`text-xs mt-1 ${msg.sender === 'shop' ? 'text-white/60' : 'text-slate-400'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700 rounded-xl px-4 py-2.5">
                  <button className="text-slate-400 hover:text-slate-600"><Paperclip size={18} /></button>
                  <input value={customerInput} onChange={e => setCustomerInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendCustomer()}
                    placeholder="Nhập tin nhắn..." className="flex-1 bg-transparent text-sm outline-none text-slate-800 dark:text-white placeholder:text-slate-400" />
                  <button onClick={handleSendCustomer} disabled={!customerInput.trim()}
                    className="w-8 h-8 rounded-lg bg-[#1a2b4c] flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-40">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Admin tab ── */}
        {tab === 'admin' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col"
            style={{ height: 'calc(100vh - 260px)' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Shield size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Peteye Admin</p>
                <p className="text-xs text-slate-400">Hỗ trợ & Quản trị hệ thống</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {adminMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageCircle size={40} className="mb-3 opacity-30" />
                  <p className="text-sm">Chưa có tin nhắn nào với Admin</p>
                  <p className="text-xs mt-1">Gửi tin nhắn để được hỗ trợ</p>
                </div>
              ) : adminMessages.map(msg => {
                const isShop = msg.senderRole === 'SHOP_OWNER';
                return (
                  <div key={msg.id} className={`flex ${isShop ? 'justify-end' : 'justify-start'}`}>
                    {!isShop && (
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center mr-2 shrink-0 mt-auto">
                        <Shield size={12} className="text-white" />
                      </div>
                    )}
                    <div className={`max-w-[70%] flex flex-col gap-1 ${isShop ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${isShop ? 'bg-[#1a2b4c] text-white rounded-br-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-sm'}`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700">
              {!connected && (
                <p className="text-xs text-orange-500 mb-2 text-center flex items-center justify-center gap-1">
                  <WifiOff size={12} /> WebSocket chưa kết nối
                </p>
              )}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700 rounded-xl px-4 py-2.5">
                <input value={adminInput} onChange={e => setAdminInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendAdmin()}
                  placeholder="Nhắn tin với Admin..."
                  className="flex-1 bg-transparent text-sm outline-none text-slate-800 dark:text-white placeholder:text-slate-400" />
                <button onClick={handleSendAdmin} disabled={!adminInput.trim() || !connected}
                  className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-40 shrink-0">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
