import React from 'react';
import { 
    Calendar, Clock, CheckCircle, ArrowRight, Video, 
    MessageCircle, Play, ClipboardList, Camera, Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function StaffDashboard() {
  const { user } = useAuth();

  const myStats = [
    { label: 'Ca trực hôm nay', value: '5', icon: Calendar, color: 'blue' },
    { label: 'Hoàn thành', value: '3', icon: CheckCircle, color: 'green' },
    { label: 'Đang xử lý', value: '1', icon: Play, color: 'orange' },
    { label: 'Tin nhắn', value: '2', icon: MessageCircle, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Workspace</h1>
           <p className="text-slate-500 font-medium mt-1">Chào {user?.name || 'Nhân viên'}. Hãy hoàn thành các ca trực hôm nay nhé!</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-[#1a2b4c] transition-all relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {myStats.map((s) => (
            <div key={s.label} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
                <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-white bg-${s.color}-500 shadow-lg shadow-${s.color}-500/20 group-hover:scale-110 transition-transform`}>
                    <s.icon size={20} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{s.value}</h3>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Urgent Tasks */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-slate-900">Ca trực hiện tại</h3>
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full animate-pulse">ĐANG DIỄN RA</span>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-48 h-48 bg-slate-100 rounded-[2rem] overflow-hidden relative group">
                        <img 
                            src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt="pet"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <button className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40">
                                <Video size={24} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div>
                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Grooming Premium</p>
                            <h2 className="text-3xl font-black text-slate-900">Cún Lu - Poodle</h2>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <Clock size={16} className="text-indigo-500" />
                                <span>Còn 45 phút</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <ClipboardList size={16} className="text-indigo-500" />
                                <span>Ghi chú: Sợ tiếng sấy to</span>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button className="px-6 py-3 bg-[#1a2b4c] text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/20 hover:scale-105 transition-transform">
                                Chụp ảnh báo cáo
                            </button>
                            <button className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 hover:scale-105 transition-transform">
                                Hoàn thành
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Việc cần làm tiếp theo</h3>
                <div className="space-y-4">
                    {[
                        { time: '14:00', name: 'Mèo Mướp', service: 'Tiêm phòng', status: 'Sắp tới' },
                        { time: '15:30', name: 'Husky Ngáo', service: 'Tắm & Sấy', status: 'Sắp tới' },
                    ].map((task, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400">{task.time.split(' ')[1]}</span>
                                <span className="text-sm font-black text-slate-900">{task.time.split(' ')[0]}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900">{task.name}</h4>
                                <p className="text-[11px] text-slate-500">{task.service}</p>
                            </div>
                            <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:bg-[#1a2b4c] group-hover:text-white transition-all shadow-sm">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#1a2b4c] to-slate-800 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <Camera size={40} className="mb-6 opacity-80" />
                    <h3 className="text-xl font-black mb-2">Báo cáo nhanh</h3>
                    <p className="text-xs opacity-70 mb-6">Chụp ảnh và gửi cập nhật tức thì cho khách hàng</p>
                    <button className="w-full py-4 bg-white text-[#1a2b4c] rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                        Mở Camera
                    </button>
                </div>
                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Trợ giúp nhanh</h3>
                <div className="grid grid-cols-1 gap-3">
                    <button className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors">
                        <Bell size={18} />
                        Cần hỗ trợ khẩn cấp
                    </button>
                    <button className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 transition-colors">
                        <MessageCircle size={18} />
                        Chat với Chủ Shop
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
