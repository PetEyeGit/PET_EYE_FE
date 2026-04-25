import React, { useState } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'shop' | 'customer';
  time: string;
  read: boolean;
}

interface Conversation {
  id: string;
  customerName: string;
  customerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  online: boolean;
  petName?: string;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    customerName: 'Nguyễn Văn A',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    lastMessage: 'Bé Miu Miu có ăn uống bình thường không ạ?',
    lastMessageTime: '10:30',
    unread: 2,
    online: true,
    petName: 'Miu Miu',
  },
  {
    id: '2',
    customerName: 'Trần Thị B',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    lastMessage: 'Cảm ơn shop đã chăm sóc Buddy rất tốt!',
    lastMessageTime: '09:15',
    unread: 0,
    online: false,
    petName: 'Buddy',
  },
  {
    id: '3',
    customerName: 'Lê Minh C',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    lastMessage: 'Cho em hỏi giá dịch vụ spa cho mèo ạ',
    lastMessageTime: 'Hôm qua',
    unread: 1,
    online: true,
    petName: 'Luna',
  },
];

const MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'Xin chào shop, em muốn đặt lịch lưu trú cho bé Miu Miu ạ', sender: 'customer', time: '09:00', read: true },
    { id: '2', text: 'Chào bạn! Shop có phòng trống từ ngày 4/3 đến 10/3 ạ. Bạn muốn đặt phòng loại nào?', sender: 'shop', time: '09:05', read: true },
    { id: '3', text: 'Em đặt phòng VIP có camera ạ', sender: 'customer', time: '09:10', read: true },
    { id: '4', text: 'Dạ được ạ. Shop đã đặt phòng VIP tầng 2 cho bé Miu Miu. Bạn có thể đưa bé đến từ 8h sáng ngày 4/3 nhé', sender: 'shop', time: '09:12', read: true },
    { id: '5', text: 'Bé Miu Miu có ăn uống bình thường không ạ?', sender: 'customer', time: '10:30', read: false },
  ],
  '2': [
    { id: '1', text: 'Cảm ơn shop đã chăm sóc Buddy rất tốt!', sender: 'customer', time: '09:15', read: true },
    { id: '2', text: 'Dạ cảm ơn bạn đã tin tưởng shop. Buddy rất ngoan và dễ thương ạ!', sender: 'shop', time: '09:20', read: true },
  ],
  '3': [
    { id: '1', text: 'Cho em hỏi giá dịch vụ spa cho mèo ạ', sender: 'customer', time: 'Hôm qua', read: false },
  ],
};

export default function ShopMessages() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(CONVERSATIONS[0]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const messages = MESSAGES[selectedConversation.id] || [];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Logic gửi tin nhắn
      setMessageText('');
    }
  };

  const filteredConversations = CONVERSATIONS.filter(conv =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.petName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-screen-2xl mx-auto px-5 md:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Tin nhắn khách hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm khách hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 ${
                    selectedConversation.id === conv.id ? 'bg-blue-50 dark:bg-slate-700' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.customerAvatar}
                      alt={conv.customerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {conv.customerName}
                      </p>
                      <span className="text-xs text-slate-400 shrink-0 ml-2">{conv.lastMessageTime}</span>
                    </div>
                    {conv.petName && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">🐾 {conv.petName}</p>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="shrink-0 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedConversation.customerAvatar}
                    alt={selectedConversation.customerName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedConversation.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedConversation.customerName}</p>
                  {selectedConversation.petName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">🐾 {selectedConversation.petName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                  <Phone size={18} className="text-slate-600 dark:text-slate-400" />
                </button>
                <button className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                  <Video size={18} className="text-slate-600 dark:text-slate-400" />
                </button>
                <button className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                  <MoreVertical size={18} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'shop' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === 'shop'
                        ? 'bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === 'shop' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-end gap-3">
                <button className="w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0">
                  <Paperclip size={20} className="text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    className="w-full px-4 py-3 bg-transparent border-none outline-none resize-none text-sm text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#1a2b4c] to-slate-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0"
                >
                  <Send size={18} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
