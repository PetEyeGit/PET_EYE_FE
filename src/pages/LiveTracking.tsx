import React from 'react';
import { Video, MessageCircle, Heart, Send, Smile, Camera, Settings, Maximize2, Volume2, ShieldCheck, Activity, Clock } from 'lucide-react';

export default function LiveTracking() {
  const [message, setMessage] = React.useState('');

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-slate-950 overflow-hidden">
      {/* Left: Video Stream */}
      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 relative group">
          <img 
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-80"
            alt="Live Stream"
          />
          
          {/* Video Overlays */}
          <div className="absolute top-8 left-8 flex items-center gap-4">
            <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl animate-pulse">
              <span className="size-2 bg-white rounded-full"></span> LIVE
            </div>
            <div className="bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-white/10">
              CAM 01 - PHÒNG LƯU TRÚ VIP
            </div>
          </div>

          <div className="absolute top-8 right-8 flex gap-2">
            <button className="p-3 bg-black/40 backdrop-blur-md text-white rounded-2xl border border-white/10 hover:bg-black/60 transition-all">
              <Volume2 size={20} />
            </button>
            <button className="p-3 bg-black/40 backdrop-blur-md text-white rounded-2xl border border-white/10 hover:bg-black/60 transition-all">
              <Maximize2 size={20} />
            </button>
            <button className="p-3 bg-black/40 backdrop-blur-md text-white rounded-2xl border border-white/10 hover:bg-black/60 transition-all">
              <Settings size={20} />
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-white/10 backdrop-blur-xl text-white px-6 py-3 rounded-full border border-white/20 font-bold text-sm flex items-center gap-2 hover:bg-white/20 transition-all">
              <Camera size={18} /> Chụp màn hình
            </button>
            <button className="bg-[#2dd4bf] text-white px-8 py-4 rounded-full font-black text-sm flex items-center gap-2 shadow-2xl shadow-[#2dd4bf]/40 hover:scale-105 transition-all">
              <MessageCircle size={20} /> Gọi cho nhân viên
            </button>
            <button className="bg-white/10 backdrop-blur-xl text-white px-6 py-3 rounded-full border border-white/20 font-bold text-sm flex items-center gap-2 hover:bg-white/20 transition-all">
              <Heart size={18} /> Gửi yêu thương
            </button>
          </div>
        </div>

        {/* Care Logs (Mobile/Tablet view) */}
        <div className="lg:hidden h-40 bg-slate-900 border-t border-white/10 p-4 overflow-x-auto flex gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[200px] bg-white/5 rounded-2xl p-3 border border-white/10">
              <p className="text-[10px] font-black text-[#2dd4bf] uppercase tracking-widest mb-1">10:30 AM</p>
              <p className="text-xs text-white font-bold">Đã cho bé ăn hạt Royal Canin</p>
            </div>
          ))}
        </div>
      </main>

      {/* Right: Interaction Panel */}
      <aside className="w-full lg:w-[450px] bg-slate-900 border-l border-white/10 flex flex-col">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="size-16 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop" className="w-full h-full object-cover" alt="Pet" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Miu Miu</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#2dd4bf]" /> Đang được chăm sóc tại PetCare
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-[#2dd4bf] mb-2">
                <Activity size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Nhịp tim</span>
              </div>
              <p className="text-2xl font-black text-white">115 <span className="text-xs font-medium text-slate-400">bpm</span></p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <Clock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Thời gian gửi</span>
              </div>
              <p className="text-2xl font-black text-white">2 <span className="text-xs font-medium text-slate-400">ngày</span></p>
            </div>
          </div>
        </div>

        {/* Care Logs / Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex border-b border-white/10">
            <button className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-[#2dd4bf] border-b-2 border-[#2dd4bf]">Nhật ký chăm sóc</button>
            <button className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Trò chuyện</button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {[
              { time: '10:30 AM', action: 'Cho ăn', desc: 'Bé đã ăn hết 50g hạt Royal Canin Indoor.', icon: <Heart size={14} />, color: 'text-pink-500' },
              { time: '09:15 AM', action: 'Vệ sinh', desc: 'Đã dọn dẹp khay vệ sinh và thay cát mới.', icon: <ShieldCheck size={14} />, color: 'text-blue-500' },
              { time: '08:00 AM', action: 'Kiểm tra', desc: 'Nhiệt độ cơ thể ổn định 38.5°C. Bé rất lanh lợi.', icon: <Activity size={14} />, color: 'text-[#2dd4bf]' },
              { time: 'Yesterday', action: 'Vận động', desc: 'Bé đã chơi đùa với cần câu mèo trong 20 phút.', icon: <Heart size={14} />, color: 'text-pink-500' },
            ].map((log, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${log.color}`}>
                    {log.icon}
                  </div>
                  {i !== 3 && <div className="w-px flex-1 bg-white/10 my-2"></div>}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-black text-white">{log.action}</h4>
                    <span className="text-[10px] font-bold text-slate-500">{log.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{log.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Message */}
        <div className="p-8 bg-black/40 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-2 flex items-center gap-2 border border-white/10">
            <input 
              className="flex-1 bg-transparent border-none text-xs font-medium text-white focus:ring-0 focus:outline-none px-4" 
              placeholder="Nhắn tin cho nhân viên trực..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="bg-[#2dd4bf] text-white p-3 rounded-xl shadow-lg shadow-[#2dd4bf]/20 hover:scale-105 transition-all">
              <Send size={18} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
