import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Calendar, DollarSign, Users, TrendingUp, TrendingDown, Bell, LayoutDashboard,
    ArrowUpRight, Video, MessageCircle, Package, Activity, Loader2,Store
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { shopService } from '../../services/shop.service';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

export default function ShopDashboard() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ['shopDashboard'],
    queryFn: () => shopService.getDashboard(),
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#1a2b4c] animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">Đang tải dữ liệu kinh doanh...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    toast.error("Không thể tải dữ liệu dashboard");
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] p-8 flex items-center justify-center">
        <p className="text-red-500 font-bold">Lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  const kpis = [
    { 
      label: 'Tổng doanh thu ', 
      value: formatCurrency(dashboardData?.totalRevenue || 0), 
      icon: DollarSign, 
      color: 'bg-emerald-500', 
      shadow: 'shadow-emerald-500/20',
      desc: 'Lũy kế từ khi bắt đầu hoạt động' 
    },
    { 
      label: 'Doanh thu tháng này', 
      value: formatCurrency(dashboardData?.revenueThisMonth || 0), 
      icon: Activity, 
      color: 'bg-blue-500', 
      shadow: 'shadow-blue-500/20',
      desc: `Tính riêng trong Tháng ${new Date().getMonth() + 1}`
    },
    { 
      label: 'Lịch hẹn', 
      value: formatNumber(dashboardData?.totalBookings || 0), 
      icon: Calendar, 
      color: 'bg-violet-500', 
      shadow: 'shadow-violet-500/20',
      desc: `${dashboardData?.pendingBookings || 0} đơn đang chờ` 
    },
    { 
      label: 'Khách hàng', 
      value: formatNumber(dashboardData?.totalCustomers || 0), 
      icon: Users, 
      color: 'bg-orange-500', 
      shadow: 'shadow-orange-500/20',
      desc: `${dashboardData?.totalPets || 0} thú cưng quản lý`
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] p-4 md:p-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
             <LayoutDashboard className="w-8 h-8 text-blue-600" />
             Tổng quan kinh doanh
           </h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
             Xin chào {user?.fullName || 'Chủ Shop'}. Chúc bạn một ngày kinh doanh hồng phát!
           </p>
        </div>
        <div className="flex items-center gap-3">
            <Link 
                to="/shop/camera" 
                className="px-6 py-3 bg-[#1a2b4c] text-white rounded-2xl font-bold shadow-lg shadow-indigo-900/20 flex items-center gap-2.5 hover:scale-[1.02] active:scale-95 transition-all text-sm group/btn relative overflow-hidden"
            >
                <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Video size={18} className="group-hover/btn:rotate-12 transition-transform" />
                <span>Live Camera</span>
            </Link>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpis.map((s) => (
            <Link 
              key={s.label} 
              to={s.label === 'Lịch hẹn' ? '/shop/bookings' : '#'}
              className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-500 group block"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${s.color} shadow-lg ${s.shadow} group-hover:scale-110 transition-transform`}>
                        <s.icon size={22} />
                    </div>
                </div>
                <p className="text-fluid-sm font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{s.value}</h3>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">{s.desc}</p>
            </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Column */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Biểu đồ doanh thu</h3>
                        <p className="text-fluid-sm text-slate-500 font-medium">Theo dõi biến động dòng tiền 7 ngày gần nhất</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Đã hoàn thành</span>
                    </div>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboardData?.revenueChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                tickFormatter={(val) => `${val/1000}k`}
                            />
                            <Tooltip 
                                formatter={(val: number) => [formatCurrency(val), 'Doanh thu']}
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
                                dataKey="amount" 
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
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Dịch vụ thịnh hành</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData?.topServices}>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                                />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                                    {dashboardData?.topServices.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={['#1a2b4c', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-[#1a2b4c] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        {dashboardData?.monthlyGrowthPercentage !== undefined && dashboardData.monthlyGrowthPercentage < 0 ? (
                            <TrendingDown size={40} className="mb-6 text-red-400" />
                        ) : (
                            <TrendingUp size={40} className="mb-6 text-emerald-400" />
                        )}
                        <h3 className="text-xl font-black mb-2">Tăng trưởng tháng</h3>
                        <p className="text-4xl font-black mb-4 tracking-tight">
                            {dashboardData?.monthlyGrowthPercentage !== undefined 
                                ? (dashboardData.monthlyGrowthPercentage > 0 ? '+' : '') + dashboardData.monthlyGrowthPercentage.toFixed(1) + '%'
                                : '0.0%'}
                        </p>
                        <p className="text-fluid-sm text-slate-300 font-medium leading-relaxed">
                          {dashboardData?.monthlyGrowthDescription || "Chưa có đủ dữ liệu để đánh giá."}
                        </p>
                        <button className="mt-6 w-full py-3 bg-white text-[#1a2b4c] rounded-xl text-fluid-sm font-black shadow-lg">Xem chi tiết</button>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Truy cập nhanh</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Dịch vụ', icon: Package, color: 'bg-indigo-500', path: '/shop/services' },
                        { label: 'Nhân viên', icon: Users, color: 'bg-emerald-500', path: '/shop/staff' },
                        { label: 'Khách hàng', icon: MessageCircle, color: 'bg-blue-500', path: '/shop/customers' },
                        { label: 'Thông Tin Cửa Hàng', icon: Store, color: 'bg-slate-500', path: '/shop/profile' },
                    ].map(a => (
                        <Link key={a.label} to={a.path} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-100 hover:shadow-lg transition-all group">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color} text-white shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform`}>
                                <a.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-tight">{a.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                        <TrendingUp size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mẹo kinh doanh</h3>
                </div>
                <div className="space-y-4">
                    {dashboardData?.pendingBookings && dashboardData.pendingBookings > 0 ? (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-900/40">
                            <p className="text-fluid-sm font-bold text-orange-600 dark:text-orange-400 mb-1">Xử lý đơn chờ</p>
                            <p className="text-[10px] text-orange-600/80 dark:text-orange-400/80 leading-relaxed">Bạn đang có {dashboardData.pendingBookings} đơn chờ xử lý. Khách hàng sẽ rất vui nếu bạn phản hồi nhanh chóng!</p>
                        </div>
                    ) : null}
                    
                    {dashboardData?.monthlyGrowthPercentage !== undefined ? (
                        dashboardData.monthlyGrowthPercentage >= 0 ? (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                                <p className="text-fluid-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1">Duy trì phong độ</p>
                                <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 leading-relaxed">
                                    Doanh thu tháng này đang tăng. Dịch vụ {dashboardData.topServices?.[0]?.name || 'nổi bật nhất'} đang làm rất tốt, hãy tiếp tục duy trì!
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                                <p className="text-fluid-sm font-bold text-blue-600 dark:text-blue-400 mb-1">Kích cầu dịch vụ</p>
                                <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
                                    Tháng này hơi vắng khách. Bạn có thể cân nhắc gửi voucher giảm giá 10% để kéo khách quay lại.
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-fluid-sm font-bold text-[#1a2b4c] dark:text-indigo-400 mb-1">Khởi đầu suôn sẻ</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">Hệ thống đang thu thập dữ liệu kinh doanh của bạn. Các phân tích thông minh sẽ sớm xuất hiện tại đây.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
