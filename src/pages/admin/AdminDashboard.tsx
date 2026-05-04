import React, { useState } from 'react';
import { Store, Users, DollarSign, Calendar, Clock, MessageCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

// Static chart data (BE chưa có endpoint breakdown theo thời gian)
const REVENUE_DATA = [
  { name: 'T1', value: 42 }, { name: 'T2', value: 58 }, { name: 'T3', value: 51 },
  { name: 'T4', value: 73 }, { name: 'T5', value: 89 }, { name: 'T6', value: 95 },
  { name: 'T7', value: 78 }, { name: 'T8', value: 102 }, { name: 'T9', value: 115 },
  { name: 'T10', value: 98 }, { name: 'T11', value: 130 }, { name: 'T12', value: 145 },
];

const BOOKING_DATA = [
  { name: 'T2', value: 28 }, { name: 'T3', value: 35 }, { name: 'T4', value: 22 },
  { name: 'T5', value: 41 }, { name: 'T6', value: 38 }, { name: 'T7', value: 50 }, { name: 'CN', value: 30 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return String(n);
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboard,
    refetchInterval: 60_000,
  });

  const cards = stats ? [
    { label: 'Tổng doanh thu', value: fmt(stats.totalRevenue) + 'đ', icon: DollarSign, color: 'blue', change: '+11%' },
    { label: 'Tổng người dùng', value: fmt(stats.totalUsers), icon: Users, color: 'green', change: '+128' },
    { label: 'Tổng shop', value: String(stats.totalShops), icon: Store, color: 'indigo', change: '+5' },
    { label: 'Tổng booking', value: fmt(stats.totalBookings), icon: Calendar, color: 'purple', change: '+34' },
    { label: 'Shop chờ duyệt', value: String(stats.pendingShops), icon: Clock, color: 'orange', change: '' },
    { label: 'Tin nhắn chưa đọc', value: String(stats.unreadMessages), icon: MessageCircle, color: 'red', change: '' },
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
                {s.change && (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-500">
                    <ArrowUpRight size={13} />{s.change}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{s.value}</h3>
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
              <p className="text-xs text-slate-400 mt-0.5">Đơn vị: triệu đồng</p>
            </div>
            <TrendingUp size={18} className="text-blue-500" />
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} formatter={(v: any) => [`${v}M`, 'Doanh thu']} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BOOKING_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {BOOKING_DATA.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Shop chờ duyệt', path: '/admin/shops', count: stats?.pendingShops, color: 'orange' },
          { label: 'Quản lý member', path: '/admin/members', count: stats?.totalUsers, color: 'green' },
          { label: 'Thông báo', path: '/admin/notifications', count: null, color: 'blue' },
          { label: 'Tin nhắn', path: '/admin/messages', count: stats?.unreadMessages, color: 'red' },
        ].map(q => (
          <Link key={q.path} to={q.path} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <p className="text-xs font-semibold text-slate-400 mb-2">{q.label}</p>
            {q.count != null && <p className="text-2xl font-black text-slate-900">{q.count}</p>}
            <p className="text-xs text-blue-500 font-semibold mt-2 group-hover:underline">Xem ngay →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
