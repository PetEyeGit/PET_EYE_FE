import React, { useEffect, useState } from 'react';
import { Store, Users, DollarSign, Calendar, Clock, MessageCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const MONTH_LABELS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const DAY_LABELS: Record<string, string> = {
  '1': 'T2', '2': 'T3', '3': 'T4', '4': 'T5', '5': 'T6', '6': 'T7', '0': 'CN',
};
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function fmtShort(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ đ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' triệu đ';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K đ';
  return n.toLocaleString('vi-VN') + 'đ';
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value.replace(' ', 'T')));
  } catch {
    return value;
  }
}


export default function AdminDashboard() {
  const currentYear = new Date().getFullYear();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboard,
    refetchInterval: 60_000,
  });

  const { data: revenueRaw = [] } = useQuery({
    queryKey: ['admin-revenue-monthly', currentYear],
    queryFn: () => adminService.getRevenueMonthly(currentYear),
    retry: false,
  });

  const { data: bookingsRaw = [] } = useQuery({
    queryKey: ['admin-bookings-weekly'],
    queryFn: () => adminService.getBookingsWeekly(),
    retry: false,
  });

  // Build revenue chart data — fill all 12 months
  const revenueData = MONTH_LABELS.map((name, i) => {
    const found = revenueRaw.find(r => r.month === i + 1);
    return { name, value: found ? Math.round(found.revenue / 1_000_000) : 0 };
  });

  // Build weekly booking chart data
  const bookingData = bookingsRaw.length > 0
    ? bookingsRaw.map(b => ({
        name: DAY_LABELS[new Date(b.date).getDay().toString()] ?? b.date,
        value: b.count,
      }))
    : [];

  const formatNum = (n: number) => n.toLocaleString('vi-VN');

  const cards = stats ? [
    { label: 'Tổng doanh thu', value: fmtShort(stats.totalRevenue), icon: DollarSign, color: 'blue', suffix: '' },
    { label: 'Tổng người dùng', value: formatNum(stats.totalUsers), icon: Users, color: 'green', suffix: 'user' },
    { label: 'Tổng shop', value: formatNum(stats.totalShops), icon: Store, color: 'indigo', suffix: 'shop' },
    { label: 'Tổng booking', value: formatNum(stats.totalBookings), icon: Calendar, color: 'purple', suffix: 'lượt' },
    { label: 'Shop chờ duyệt', value: formatNum(stats.pendingShops), icon: Clock, color: 'orange', suffix: 'shop' },
    { label: 'Tin nhắn chưa đọc', value: formatNum(stats.unreadMessages), icon: MessageCircle, color: 'red', suffix: 'tin nhắn' },
  ] : [];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <>
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Tổng quan hệ thống</h1>
          <p className="text-slate-500 text-sm mt-1">Thống kê toàn bộ hoạt động của Peteye</p>
        </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {cards.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[s.color]}`}>
                  <s.icon size={20} />
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
                {s.value}
                {s.suffix && <span className="text-sm font-bold text-slate-500">{s.suffix}</span>}
              </h3>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Doanh thu theo tháng</h3>
              <p className="text-xs text-slate-400 mt-0.5">Đơn vị: triệu đồng — {currentYear}</p>
            </div>
            <TrendingUp size={18} className="text-blue-500" />
          </div>
          <div className="h-[220px]">
            {revenueData.every(d => d.value === 0) ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Chưa có dữ liệu doanh thu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} formatter={(v: any) => [fmt(v * 1_000_000), 'Doanh thu']} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Booking chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Booking trong tuần</h3>
              <p className="text-xs text-slate-400 mt-0.5">7 ngày gần nhất</p>
            </div>
            <Calendar size={18} className="text-purple-500" />
          </div>
          <div className="h-[220px]">
            {bookingData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Chưa có dữ liệu booking tuần này
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                <BarChart data={bookingData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {bookingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Shop chờ duyệt', path: '/admin/shops', count: stats?.pendingShops },
          { label: 'Quản lý member', path: '/admin/members', count: stats?.totalUsers },
          { label: 'Thông báo', path: '/admin/notifications', count: null },
          { label: 'Tin nhắn', path: '/admin/messages', count: stats?.unreadMessages },
        ].map(q => (
          <Link key={q.path} to={q.path} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <p className="text-xs font-semibold text-slate-400 mb-2">{q.label}</p>
            {q.count != null && <p className="text-2xl font-black text-slate-900">{q.count}</p>}
            <p className="text-xs text-blue-500 font-semibold mt-2 group-hover:underline">Xem ngay →</p>
          </Link>
        ))}
      </div>
    </div>
  </>
  );
}
