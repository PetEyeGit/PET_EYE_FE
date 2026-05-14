import React, { useState } from 'react';
import { Search, Store, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { useAdminChat } from '../../hooks/useAdminChat';
import { useAuth } from '../../contexts/AuthContext';
import ConversationThread from '../../components/chat/shared/ConversationThread';

export default function AdminMessages() {
  const { user } = useAuth();
  const [activeShopId, setActiveShopId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const { data: shops = [] } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: adminService.getAllShops,
  });

  const { messages, connected, sendMessage } = useAdminChat(activeShopId, user?.token);

  const activeShop = shops.find(s => s.id === activeShopId);

  const filteredShops = shops.filter(s =>
    s.shopName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (shopId: number) => {
    setActiveShopId(shopId);
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 m-4">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900">Tin nhắn</h1>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm cửa hàng..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cửa hàng</span>
          </div>

          {filteredShops.length === 0 ? (
            <div className="px-6 py-4 text-[11px] text-slate-400 italic">Không có cửa hàng nào</div>
          ) : filteredShops.map(s => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                activeShopId === s.id
                  ? 'bg-white shadow-sm ring-1 ring-slate-100'
                  : 'hover:bg-white/50'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Store size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={`font-bold text-sm leading-tight truncate ${activeShopId === s.id ? 'text-blue-700' : 'text-slate-900'}`}>
                  {s.shopName}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{s.shopType} • {s.city}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <ConversationThread
        containerClassName="flex-1 rounded-r-3xl"
        messages={messages}
        currentUserEmail={user?.email}
        connected={connected}
        input={input}
        setInput={setInput}
        onSendMessage={(msg, attachment) => {
          if (activeShopId) sendMessage(activeShopId, msg, attachment);
        }}
        headerInfo={activeShop ? {
          title: activeShop.shopName,
          subtitle: `${activeShop.shopType} • ${activeShop.city}`,
          icon: <Store size={22} className="text-blue-600" />,
          showStatus: true,
        } : undefined}
        disableInput={!activeShopId}
        placeholder={activeShop ? 'Nhập tin nhắn...' : 'Chọn cửa hàng để bắt đầu'}
      />
    </div>
  );
}
