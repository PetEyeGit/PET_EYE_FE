import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Search, Filter, TrendingUp, X, ChevronRight, Clock, ChevronLeft, CreditCard, Heart, Package, Shield, Star, Gift, Rocket, Check } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  pets: number;
  totalBookings: number;
  totalSpent: string;
  lastVisit: string;
  avatar: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CUS001',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    pets: 2,
    totalBookings: 15,
    totalSpent: '4.500.000đ',
    lastVisit: '04/03/2026',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  },
  {
    id: 'CUS002',
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0912345678',
    pets: 1,
    totalBookings: 8,
    totalSpent: '2.100.000đ',
    lastVisit: '05/03/2026',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  },
  {
    id: 'CUS003',
    name: 'Lê Văn C',
    email: 'levanc@email.com',
    phone: '0923456789',
    pets: 3,
    totalBookings: 22,
    totalSpent: '7.800.000đ',
    lastVisit: '03/03/2026',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  },
];

export default function ShopCustomers() {
  const [customers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'regular' | 'vip'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredCustomers = customers.filter((customer) => {
    const searchMatch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    if (!searchMatch) return false;

    if (filter === 'all') return true;

    // Determine customer category
    const lastVisitDate = new Date(customer.lastVisit.split('/').reverse().join('-'));
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
    const isNew = daysDiff <= 7;

    const spentAmount = parseInt(customer.totalSpent.replace(/\D/g, ''));
    const isVIP = spentAmount >= 5000000 || customer.totalBookings >= 20;

    if (filter === 'new') return isNew;
    if (filter === 'vip') return isVIP;
    if (filter === 'regular') return !isNew && !isVIP;

    return true;
  });

  const getCustomerTier = (customer: Customer) => {
    const spentAmount = parseInt(customer.totalSpent.replace(/\D/g, ''));
    if (spentAmount >= 5000000 || customer.totalBookings >= 20) {
      return { label: 'Khách hàng VIP', color: 'bg-yellow-500', text: 'text-white', icon: <TrendingUp size={12} /> };
    }
    if (customer.totalBookings >= 10) {
      return { label: 'Khách thân thiết', color: 'bg-indigo-500', text: 'text-white', icon: <Shield size={12} /> };
    }
    return { label: 'Khách hàng mới', color: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400', icon: <User size={12} /> };
  };

  const getTierStats = (customer: Customer) => {
    const spentAmount = parseInt(customer.totalSpent.replace(/\D/g, ''));
    if (spentAmount >= 5000000 || customer.totalBookings >= 20) {
      return { current: 'VIP', next: 'CHAMPION', progress: 100, perks: ['Ưu tiên chăm sóc', 'Ưu đãi 15%', 'Tặng quà sinh nhật', 'Lưu trú miễn phí 1 ngày'] };
    }
    if (customer.totalBookings >= 10) {
      const progress = Math.min(100, (customer.totalBookings / 20) * 100);
      return { current: 'Thân thiết', next: 'VIP', progress, perks: ['Ưu đãi 10%', 'Tích điểm đổi quà', 'Ưu tiên đặt chỗ'] };
    }
    const progress = Math.min(100, (customer.totalBookings / 10) * 100);
    return { current: 'Mới', next: 'Thân thiết', progress, perks: ['Tích điểm cơ bản', 'Nhận tin tức ưu đãi'] };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Image */}
        <div className="mb-8 relative">
          <div className="absolute right-0 top-0 w-64 h-64 opacity-10 pointer-events-none hidden lg:block">

          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quản lý khách hàng</h1>
            <p className="text-slate-600 dark:text-slate-400">Danh sách khách hàng và lịch sử giao dịch</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Tổng khách hàng', value: customers.length, gradient: 'from-[#1a2b4c] to-slate-700', icon: '👥' },
            { label: 'Khách hàng mới (tháng này)', value: 12, gradient: 'from-green-500 to-emerald-600', icon: '✨' },
            { label: 'Khách hàng thân thiết', value: 45, gradient: 'from-purple-500 to-purple-600', icon: '⭐' },
          ].map((stat) => (
            <div key={stat.label} className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-700/20 rounded-bl-full group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                  <span className="text-xl">{stat.icon}</span>
                  {stat.label}
                </p>
                <p className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm mb-6 border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Tìm khách hàng theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-all">
              <Filter size={20} />
              Lọc
            </button>
          </div>

          {/* Customer Type Filters */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'new', label: 'Khách hàng mới' },
              { value: 'regular', label: 'Khách hàng thường' },
              { value: 'vip', label: 'Khách hàng VIP' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as any)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filter === tab.value
                    ? 'bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customers List */}
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-700/20 rounded-bl-full group-hover:scale-110 transition-transform" />
              <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                {/* Avatar & Basic Info */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-700 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-none">{customer.name}</h3>
                        {(() => {
                            const tier = getCustomerTier(customer);
                            return (
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${tier.color} ${tier.text}`}>
                                    {tier.icon}
                                    {tier.label}
                                </span>
                            );
                        })()}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">#{customer.id}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-300">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Phone size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-300">{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Calendar size={16} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-300">Lần cuối: {customer.lastVisit}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 self-start">

                    {/* Thú cưng */}
                    <div className="h-20 flex flex-col justify-center text-center
                  bg-blue-50 dark:bg-blue-900/30
                  rounded-xl">
                      <p className="text-[11px] text-blue-600 dark:text-blue-300">
                        Thú cưng
                      </p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-200">
                        {customer.pets}
                      </p>
                    </div>

                    {/* Lượt đặt */}
                    <div className="h-20 flex flex-col justify-center text-center
                  bg-emerald-50 dark:bg-emerald-900/30
                  rounded-xl">
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-300">
                        Lượt đặt
                      </p>
                      <p className="text-xl font-bold text-emerald-700 dark:text-emerald-200">
                        {customer.totalBookings}
                      </p>
                    </div>

                    {/* Tổng chi */}
                    <div className="h-20 flex flex-col justify-center text-center
                  bg-gradient-to-br from-[#1a2b4c] to-slate-700
                  rounded-xl">
                      <p className="text-[11px] text-slate-300">
                        Tổng chi
                      </p>
                      <p className="text-lg font-bold text-white">
                        {customer.totalSpent.replace('.000đ', 'K')}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:w-36">
                  <button 
                    onClick={() => {
                        setSelectedCustomer(customer);
                        setShowDetailModal(true);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all text-sm"
                  >
                    Xem chi tiết
                  </button>
                  <button className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm">
                    Liên hệ
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">Không tìm thấy khách hàng</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>

        {/* Customer Detail Modal */}
        {showDetailModal && selectedCustomer && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
                    {/* Left Sidebar - Profile Summary */}
                    <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800/50 p-8 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <img 
                                src={selectedCustomer.avatar} 
                                className="w-32 h-32 rounded-[2rem] object-cover shadow-xl border-4 border-white dark:border-slate-800" 
                                alt={selectedCustomer.name}
                            />
                            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white p-2 rounded-xl shadow-lg">
                                <TrendingUp size={16} />
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{selectedCustomer.name}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{selectedCustomer.id}</p>

                        <div className="mt-4">
                            {(() => {
                                const tier = getCustomerTier(selectedCustomer);
                                return (
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl shadow-sm ${tier.color} ${tier.text}`}>
                                        {tier.icon}
                                        <span className="text-xs font-black uppercase tracking-wider">{tier.label}</span>
                                    </div>
                                );
                            })()}
                        </div>
                        
                        <div className="w-full space-y-3 mt-8 text-left">
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                    <Mail size={16} />
                                </div>
                                <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{selectedCustomer.email}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                    <Phone size={16} />
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{selectedCustomer.phone}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 w-full">
                            <button className="w-full py-3 bg-[#1a2b4c] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm shadow-lg shadow-indigo-900/20">
                                <Mail size={18} />
                                Gửi thông báo
                            </button>
                        </div>
                    </div>

                    {/* Right Content - Tabs/Details */}
                    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
                        <div className="p-6 md:p-8 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
                            <div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Chi tiết hoạt động</h4>
                                <p className="text-xs text-slate-500 font-medium">Lịch sử giao dịch và dịch vụ đã sử dụng</p>
                            </div>
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-8 flex-1 overflow-y-auto space-y-8">
                            {/* Membership Progress Section */}
                            <section className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50">
                                {(() => {
                                    const tierInfo = getTierStats(selectedCustomer);
                                    return (
                                        <>
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <h5 className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-1">Cấp bậc hiện tại</h5>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-black text-slate-900 dark:text-white">{tierInfo.current}</span>
                                                        <Shield className="text-indigo-500" size={20} />
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-slate-400 mb-1 leading-tight">Mục tiêu tiếp theo: <span className="text-slate-900 dark:text-white font-black">{tierInfo.next}</span></p>
                                                    <p className="text-xs font-black text-indigo-500">{Math.round(tierInfo.progress)}%</p>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="w-full h-3 bg-white dark:bg-slate-700 rounded-full p-0.5 shadow-inner">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                                                    style={{ width: `${tierInfo.progress}%` }}
                                                />
                                            </div>

                                            {/* Perks Grid */}
                                            <div className="mt-6">
                                                <h6 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Quyền lợi hiện có</h6>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {tierInfo.perks.map((perk, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500">
                                                                <Check size={10} strokeWidth={4} />
                                                            </div>
                                                            {perk}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </section>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { label: 'Tổng chi tiêu', value: selectedCustomer.totalSpent, icon: <CreditCard size={18} />, color: 'teal' },
                                    { label: 'Số thú cưng', value: selectedCustomer.pets, icon: <Heart size={18} />, color: 'pink' },
                                    { label: 'Lịch đã đặt', value: selectedCustomer.totalBookings, icon: <Package size={18} />, color: 'indigo' },
                                ].map(s => (
                                    <div key={s.label} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <div className={`w-9 h-9 rounded-xl bg-${s.color}-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-${s.color}-500/20`}>
                                            {s.icon}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
                                        <h5 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">{s.value}</h5>
                                    </div>
                                ))}
                            </div>

                            {/* Section: List of Pets */}
                            <section>
                                <h5 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-teal-500 rounded-full" />
                                    Danh sách thú cưng
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { name: 'Kem', breed: 'Poodle', age: '2 tuổi', gender: 'Cái', img: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=300' },
                                        { name: 'Bông', breed: 'Mèo Mỹ', age: '1 tuổi', gender: 'Đực', img: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=300' },
                                    ].slice(0, selectedCustomer.pets).map(pet => (
                                        <div key={pet.name} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all group cursor-pointer">
                                            <img src={pet.img} className="w-16 h-16 rounded-xl object-cover group-hover:scale-105 transition-transform shadow-md" alt={pet.name} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-slate-800 dark:text-white">{pet.name}</p>
                                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">{pet.gender}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium">{pet.breed} • {pet.age}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Section: Recent History */}
                            <section>
                                <h5 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                                    Lịch sử gần đây
                                </h5>
                                <div className="space-y-3">
                                    {[
                                        { action: 'Khám tổng quát', time: '04/03/2026 - 10:30', status: 'completed', price: '250.000đ' },
                                        { action: 'Grooming & Spa', time: '28/02/2026 - 15:45', status: 'completed', price: '450.000đ' },
                                        { action: 'Mua hạt Royal Canin', time: '20/02/2026 - 09:20', status: 'completed', price: '850.000đ' },
                                    ].map((h, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 shadow-sm transition-colors">
                                                    <Clock size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800 dark:text-white">{h.action}</p>
                                                    <p className="text-[10px] text-slate-500">{h.time}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-slate-900 dark:text-white">{h.price}</p>
                                                <span className="text-[9px] font-bold text-green-500 uppercase">Thành công</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
