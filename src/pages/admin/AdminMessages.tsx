import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Store, Shield, Wifi, WifiOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { useAdminChat } from '../../hooks/useAdminChat';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminMessages() {
  const { user } = useAuth();
  const [activeShopId, setActiveShopId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: shops = [] } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: adminService.getAllShops,
  });

  const { messages, connected, sendMessage } = useAdminChat(activeShopId, user?.token);

  const activeShop = shops.find(s => s.id === activeShopId);

  const filteredShops = shops.filter(s =>
    s.shopName.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() || !activeShopId) return;
    sendMessage(activeShopId, input.trim());
    setInput('');
  };

  const handleSelect = async (shopId: number) => {
    setActiveShopId(shopId);
    setInput('');
  };

  return (
    <div className="p-6 md:p-8 h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Tin nhắn</h1>
          <p className="text-slate-500 text-sm mt-1">Trao đổi trực tiếp với các cửa hàng</p>
        </div>
        <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
          {connected ? 'Đã kết nối' : 'Chưa kết nối'}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex"
        style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>

        {/* Shop list */}
        <div className="w-72 shrink-0 border-r border-slate-100 flex flex-col">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm cửa hàng..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredShops.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-slate-400 text-xs">Không có shop nào</div>
            ) : filteredShops.map(s => (
              <button key={s.id} onClick={() => handleSelect(s.id)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors border-b border-slate-50
                  ${activeShopId === s.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Store size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${activeShopId === s.id ? 'text-blue-700' : 'text-slate-800'}`}>
                    {s.shopName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{s.shopType} • {s.city}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {activeShop ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <Store size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{activeShop.shopName}</p>
                <p className="text-[11px] text-slate-400">{activeShop.shopType} • {activeShop.city}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  Chưa có tin nhắn nào
                </div>
              ) : messages.map(msg => {
                const isAdmin = msg.senderRole === 'ADMIN';
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    {!isAdmin && (
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2 shrink-0 mt-auto">
                        <Store size={12} className="text-blue-600" />
                      </div>
                    )}
                    <div className={`max-w-[70%] flex flex-col gap-1 ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${isAdmin ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center ml-2 shrink-0 mt-auto">
                        <Shield size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-3.5 border-t border-slate-100">
              {!connected && (
                <p className="text-xs text-orange-500 mb-2 text-center">WebSocket chưa kết nối — tin nhắn có thể không gửi được</p>
              )}
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400" />
                <button onClick={handleSend} disabled={!input.trim()}
                  className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-40 shrink-0">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Store size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Chọn một cửa hàng để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
