import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Send, Image, Paperclip, Smile, MoreVertical, Phone, Video, Info, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Messaging() {
  const [message, setMessage] = React.useState('');

  const chats = [
    { id: 1, name: 'PetCare Sài Gòn', lastMsg: 'Bác sĩ đã nhận được kết quả xét nghiệm...', time: '10:30 AM', unread: 2, online: true, img: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop' },
    { id: 2, name: 'BS. Trần Văn An', lastMsg: 'Bạn nhớ cho bé uống thuốc đúng giờ nhé!', time: 'Yesterday', unread: 0, online: true, img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop' },
    { id: 3, name: 'Happy Paws Spa', lastMsg: 'Lịch hẹn tắm của Miu Miu đã được xác nhận.', time: 'Oct 24', unread: 0, online: false, img: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?q=80&w=2070&auto=format&fit=crop' },
  ];

  return (
    <div className="flex-1 flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar: Chat List */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black tracking-tight">Tin nhắn</h1>
            <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm" placeholder="Tìm kiếm cuộc trò chuyện..." />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {chats.map((chat) => (
            <div key={chat.id} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${chat.id === 1 ? 'bg-[#1a2b4c]/5 border border-[#1a2b4c]/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <div className="relative shrink-0">
                <div className="size-14 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                  <img src={chat.img} className="w-full h-full object-cover" alt={chat.name} />
                </div>
                {chat.online && <span className="absolute -bottom-1 -right-1 size-4 bg-green-500 rounded-full border-4 border-white dark:border-slate-900"></span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm truncate">{chat.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 truncate pr-4">{chat.lastMsg}</p>
                  {chat.unread > 0 && <span className="size-5 bg-[#1a2b4c] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{chat.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main: Chat Window */}
      <main className="hidden md:flex flex-1 flex-col bg-slate-50 dark:bg-slate-950 relative">
        {/* Chat Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl overflow-hidden shadow-sm">
              <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop" className="w-full h-full object-cover" alt="Clinic" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">PetCare Sài Gòn</h3>
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                <span className="size-1.5 bg-green-500 rounded-full"></span> Đang hoạt động
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><Phone size={20} /></button>
            <button className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><Video size={20} /></button>
            <button className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><Info size={20} /></button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex justify-center">
            <span className="px-4 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hôm nay</span>
          </div>

          {/* Recipient Message */}
          <div className="flex items-end gap-3 max-w-[70%]">
            <div className="size-8 rounded-lg overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop" className="w-full h-full object-cover" alt="Clinic" />
            </div>
            <div className="space-y-2">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">Chào bạn, bác sĩ đã nhận được kết quả xét nghiệm máu của bé Miu Miu rồi nhé. Mọi chỉ số đều rất tốt!</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 ml-1">10:30 AM</span>
            </div>
          </div>

          {/* Sender Message */}
          <div className="flex flex-row-reverse items-end gap-3 max-w-[70%] ml-auto">
            <div className="size-8 rounded-lg overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" className="w-full h-full object-cover" alt="User" />
            </div>
            <div className="space-y-2 text-right">
              <div className="bg-[#1a2b4c] p-4 rounded-2xl rounded-br-none shadow-lg shadow-[#1a2b4c]/10">
                <p className="text-sm text-white leading-relaxed">Ôi may quá, cảm ơn bác sĩ nhiều ạ. Vậy mình có cần thay đổi chế độ ăn cho bé không bác sĩ?</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 mr-1">10:32 AM</span>
            </div>
          </div>

          {/* Recipient Message with Image */}
          <div className="flex items-end gap-3 max-w-[70%]">
            <div className="size-8 rounded-lg overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop" className="w-full h-full object-cover" alt="Clinic" />
            </div>
            <div className="space-y-2">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">Đây là đơn thuốc bổ sung vitamin cho bé, bạn có thể ghé lấy hoặc chúng tôi sẽ ship tận nơi nhé.</p>
                <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                  <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop" className="w-full h-48 object-cover" alt="Prescription" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 ml-1">10:35 AM</span>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-[2rem] p-2 flex items-center gap-2 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-1 px-2">
              <button className="p-2 text-slate-400 hover:text-[#1a2b4c] transition-colors"><Paperclip size={20} /></button>
              <button className="p-2 text-slate-400 hover:text-[#1a2b4c] transition-colors"><Image size={20} /></button>
            </div>
            <input 
              className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 focus:outline-none px-2" 
              placeholder="Nhập tin nhắn của bạn..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-[#1a2b4c] transition-colors"><Smile size={20} /></button>
              <button className="bg-[#1a2b4c] text-white p-3 rounded-full shadow-lg shadow-[#1a2b4c]/20 hover:scale-105 transition-all active:scale-95">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Pet Info */}
      <aside className="hidden lg:flex w-80 border-l border-slate-200 dark:border-slate-800 flex-col bg-white dark:bg-slate-900 p-8">
        <Link to="/pet/1" className="flex flex-col items-center text-center space-y-6 group">
          <div className="size-32 rounded-[2rem] overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl group-hover:scale-105 transition-transform">
            <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop" className="w-full h-full object-cover" alt="Pet" />
          </div>
          <div>
            <h3 className="text-2xl font-black group-hover:text-[#1a2b4c] transition-colors">Miu Miu</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Scottish Fold • 3 Tuổi</p>
          </div>
        </Link>

        <div className="mt-10 space-y-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thông tin sức khỏe</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cân nặng</p>
                <p className="font-black text-sm">4.2 kg</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nhiệt độ</p>
                <p className="font-black text-sm">38.5°C</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hành động nhanh</h4>
            <div className="flex flex-col gap-2">
              <button className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-all flex items-center justify-between">
                Xem hồ sơ bệnh án <ChevronRight size={14} />
              </button>
              <button className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-all flex items-center justify-between">
                Lịch sử tiêm phòng <ChevronRight size={14} />
              </button>
              <button className="w-full py-3 px-4 rounded-xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-xs font-bold text-[#2dd4bf] hover:bg-[#2dd4bf]/20 transition-all flex items-center justify-between">
                Đặt lịch tái khám <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
