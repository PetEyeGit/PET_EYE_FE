import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Store, Calendar, Package, DollarSign, Users, TrendingUp, Clock, 
    CheckCircle, ArrowUpRight, ArrowRight, MoreHorizontal, Bell,
    ArrowDownRight, CreditCard, Video, ChevronRight, MessageCircle, Settings,
    Camera
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

const REVENUE_DATA = [
  { name: 'T2', value: 2400 },
  { name: 'T3', value: 1398 },
  { name: 'T4', value: 9800 },
  { name: 'T5', value: 3908 },
  { name: 'T6', value: 4800 },
  { name: 'T7', value: 3800 },
  { name: 'CN', value: 4300 },
];

const SERVICE_DATA = [
  { name: 'Lưu trú', value: 400, color: '#1a2b4c' },
  { name: 'Spa', value: 300, color: '#3b82f6' },
  { name: 'Khám bệnh', value: 200, color: '#10b981' },
  { name: 'Grooming', value: 150, color: '#f59e0b' },
];

export default function ShopDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Đơn hôm nay', value: '12', icon: Calendar, color: 'blue', change: '+3', trend: 'up' },
    { label: 'Doanh thu tháng', value: '45.2M', icon: DollarSign, color: 'green', change: '+12%', trend: 'up' },
    { label: 'Khách hàng', value: '234', icon: Users, color: 'purple', change: '+8', trend: 'up' },
    { label: 'Tỉ lệ quay lại', value: '68%', icon: TrendingUp, color: 'orange', change: '-2%', trend: 'down' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] p-4 md:p-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Tổng quan cửa hàng</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Xin chào, {user?.name || 'Peteye Shop'}. Chúc bạn một ngày kinh doanh tốt lành!</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-[#1a2b4c] transition-all relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
            </button>
            <div className="h-12 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2" />
            <Link 
                to="/shop/camera" 
                className="px-6 py-3 bg-[#1a2b4c] text-white rounded-2xl font-bold shadow-lg shadow-indigo-900/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm"
            >
                <Video size={18} />
                Xem Live Camera
            </Link>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-500 group">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-${s.color}-500 shadow-lg shadow-${s.color}-500/20 group-hover:scale-110 transition-transform`}>
                        <s.icon size={22} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-black ${s.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {s.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {s.change}
                    </div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{s.value}</h3>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Column */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Doanh thu tuần này</h3>
                        <p className="text-xs text-slate-500 font-medium">Theo dõi biến động dòng tiền trong 7 ngày</p>
                    </div>
                    <select className="bg-slate-50 dark:bg-slate-700 border-none rounded-xl text-xs font-bold px-4 py-2 outline-none">
                        <option>7 ngày gần nhất</option>
                        <option>30 ngày gần nhất</option>
                    </select>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    borderRadius: '16px', 
                                    border: 'none', 
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorVal)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Phân bổ dịch vụ</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={SERVICE_DATA}>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                                />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                    {SERVICE_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 to-[#1a2b4c] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <CreditCard size={40} className="mb-6 opacity-80" />
                        <h3 className="text-xl font-black mb-2">Số dư ví Shop</h3>
                        <p className="text-4xl font-black mb-6 tracking-tight">12.450.000đ</p>
                        <div className="flex gap-4">
                            <button className="flex-1 py-3 bg-white text-[#1a2b4c] rounded-xl text-xs font-black shadow-lg">Rút tiền</button>
                            <button className="flex-1 py-3 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-black">Lịch sử</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lịch hẹn mới nhất</h3>
                    <Link to="/shop/bookings" className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Tất cả</Link>
                </div>
                <div className="space-y-6">
                    {[
                        { name: 'Nguyễn Văn A', pet: 'Cún Lu', time: '10:30 SA', img: 'https://i.pravatar.cc/150?u=a' },
                        { name: 'Trần Thị B', pet: 'Mèo Mướp', time: '11:45 SA', img: 'https://i.pravatar.cc/150?u=b' },
                        { name: 'Lê Văn C', pet: 'Poodle Min', time: '02:00 CH', img: 'https://i.pravatar.cc/150?u=c' },
                        { name: 'Phạm Anh D', pet: 'Husky Ngáo', time: '04:15 CH', img: 'https://i.pravatar.cc/150?u=d' },
                    ].map((b, i) => (
                        <div key={i} className="flex items-center gap-4 group cursor-pointer">
                            <div className="relative">
                                <img src={b.img} className="w-10 h-10 rounded-full object-cover shadow-sm group-hover:scale-110 transition-transform" />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{b.name}</h4>
                                <p className="text-[10px] text-slate-500">{b.pet} • {b.time}</p>
                            </div>
                            <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-[#1a2b4c] group-hover:text-white transition-all">
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Truy cập nhanh</h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Dịch vụ', icon: Package, color: 'indigo', path: '/shop/services' },
                        { label: 'Camera', icon: Camera, color: 'teal', path: '/shop/camera' },
                        { label: 'Tin nhắn', icon: MessageCircle, color: 'blue', path: '/shop/messages' },
                        { label: 'Cài đặt', icon: Settings, color: 'slate', path: '/shop/profile' },
                    ].map(a => (
                        <Link key={a.label} to={a.path} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-100 hover:shadow-lg transition-all group">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${a.color}-500 text-white shadow-lg shadow-${a.color}-500/20 group-hover:scale-110 transition-transform`}>
                                <a.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-tight">{a.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
