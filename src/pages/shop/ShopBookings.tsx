import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, Search, Filter } from 'lucide-react';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  petName: string;
  petType: string;
  service: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
  price: string;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BK001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    customerEmail: 'nguyenvana@email.com',
    petName: 'Milo',
    petType: 'Chó Golden',
    service: 'Grooming - Gói Premium',
    date: '05/03/2026',
    time: '09:00',
    status: 'pending',
    notes: 'Chó rất hiền, không cần rọ mõm',
    price: '450.000đ',
  },
  {
    id: 'BK002',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    customerEmail: 'tranthib@email.com',
    petName: 'Luna',
    petType: 'Mèo Ba Tư',
    service: 'Khám bệnh - Tiêm phòng',
    date: '05/03/2026',
    time: '10:30',
    status: 'confirmed',
    price: '300.000đ',
  },
  {
    id: 'BK003',
    customerName: 'Lê Văn C',
    customerPhone: '0923456789',
    customerEmail: 'levanc@email.com',
    petName: 'Max',
    petType: 'Chó Husky',
    service: 'Lưu trú - Phòng VIP',
    date: '04/03/2026',
    time: '14:00',
    status: 'completed',
    price: '750.000đ',
  },
];

export default function ShopBookings() {
  const [bookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusConfig = (status: BookingStatus) => {
    const configs = {
      pending: {
        label: 'Chờ xác nhận',
        icon: AlertCircle,
        className: 'bg-orange-100 text-orange-700',
      },
      confirmed: {
        label: 'Đã xác nhận',
        icon: CheckCircle,
        className: 'bg-blue-100 text-blue-700',
      },
      completed: {
        label: 'Hoàn thành',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700',
      },
      cancelled: {
        label: 'Đã hủy',
        icon: XCircle,
        className: 'bg-red-100 text-red-700',
      },
    };
    return configs[status];
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = (bookingId: string, newStatus: BookingStatus) => {
    console.log(`Update booking ${bookingId} to ${newStatus}`);
    // Implement status update logic
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Image */}
        <div className="mb-8 relative">
          <div className="absolute right-0 top-0 w-64 h-64 opacity-10 pointer-events-none hidden lg:block">
            
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quản lý đơn đặt lịch</h1>
            <p className="text-slate-600 dark:text-slate-400">Xem và xử lý các đơn đặt lịch từ khách hàng</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm mb-6 border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Tìm theo tên khách hàng, thú cưng, mã đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'pending', label: 'Chờ xác nhận' },
                { value: 'confirmed', label: 'Đã xác nhận' },
                { value: 'completed', label: 'Hoàn thành' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    filter === tab.value
                      ? 'bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Chờ xác nhận', value: bookings.filter((b) => b.status === 'pending').length, gradient: 'from-orange-500 to-orange-600', icon: '⏳' },
            { label: 'Đã xác nhận', value: bookings.filter((b) => b.status === 'confirmed').length, gradient: 'from-blue-500 to-blue-600', icon: '✓' },
            { label: 'Hoàn thành', value: bookings.filter((b) => b.status === 'completed').length, gradient: 'from-green-500 to-emerald-600', icon: '✓' },
            { label: 'Tổng đơn', value: bookings.length, gradient: 'from-purple-500 to-purple-600', icon: '📋' },
          ].map((stat) => (
            <div key={stat.label} className="group bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-700/20 rounded-bl-full group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                  <span className="text-lg">{stat.icon}</span>
                  {stat.label}
                </p>
                <p className={`text-3xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={booking.id} className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-700/20 rounded-bl-full group-hover:scale-110 transition-transform" />
                <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">#{booking.id}</h3>
                          <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.className}`}>
                            <StatusIcon size={14} />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{booking.service}</p>
                      </div>
                      <p className="text-lg font-bold bg-gradient-to-r from-[#1a2b4c] to-slate-700 bg-clip-text text-transparent">{booking.price}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User size={16} className="text-slate-400" />
                          <span className="font-semibold">{booking.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={16} className="text-slate-400" />
                          <span className="text-slate-600">{booking.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={16} className="text-slate-400" />
                          <span className="text-slate-600">{booking.customerEmail}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">Thú cưng:</span>
                          <span className="text-slate-600">{booking.petName} ({booking.petType})</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={16} className="text-slate-400" />
                          <span className="text-slate-600">{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={16} className="text-slate-400" />
                          <span className="text-slate-600">{booking.time}</span>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1.5 flex items-center gap-1.5">
                          <span>💬</span> Ghi chú:
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{booking.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                          className="px-4 py-2.5 bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          ✓ Xác nhận
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                          className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-100 dark:border-red-900/30"
                        >
                          ✕ Từ chối
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'completed')}
                        className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        ✓ Hoàn thành
                        </button>
                    )}
                    <button className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredBookings.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <Calendar className="w-12 h-12 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">Không có đơn đặt lịch nào</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Các đơn đặt lịch sẽ hiển thị ở đây</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
