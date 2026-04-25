import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, Clock, MapPin, ChevronRight,
  MoreVertical, Plus, Home, Stethoscope, Scissors, Video,
  Star, Phone, CheckCircle, AlertCircle, XCircle, Wifi, ArrowLeft
} from 'lucide-react';

/* ─── TYPES ─────────────────────────────────────────────────────────── */
type Status = 'Đang lưu trú' | 'Sắp tới' | 'Hoàn thành' | 'Đã huỷ';
type ServiceType = 'boarding' | 'clinic' | 'grooming';

interface Booking {
  id: string;
  clinic: string;
  address: string;
  service: string;
  serviceType: ServiceType;
  pet: string;
  petAvatar: string;
  checkIn: string;
  checkOut: string;
  time: string;
  status: Status;
  image: string;
  price: string;
  rating?: number;
  cameraEnabled?: boolean;
  room?: string;
}

/* ─── DATA ───────────────────────────────────────────────────────────── */
const BOOKINGS: Booking[] = [
  {
    id: 'LT-2402',
    clinic: 'Peteye PetCare – Quận 1',
    address: '123 Đường Thú Cưng, Quận 1, TP.HCM',
    service: 'Lưu trú VIP (Phòng đơn – Điều hoà)',
    serviceType: 'boarding',
    pet: 'Miu Miu',
    petAvatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop',
    checkIn: '27/02/2026',
    checkOut: '01/03/2026',
    time: '09:00 SA',
    status: 'Đang lưu trú',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop',
    price: '750.000đ / đêm',
    room: 'CAM 01 – Phòng VIP A5',
    cameraEnabled: true,
  },
  {
    id: 'BK-9921',
    clinic: 'PetCare Sài Gòn',
    address: '45 Nguyễn Trãi, Quận 5, TP.HCM',
    service: 'Khám tổng quát định kỳ',
    serviceType: 'clinic',
    pet: 'Miu Miu',
    petAvatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop',
    checkIn: '05/03/2026',
    checkOut: '05/03/2026',
    time: '09:30 SA',
    status: 'Sắp tới',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop',
    price: '250.000đ',
  },
  {
    id: 'SP-8801',
    clinic: 'Happy Paws Spa',
    address: '78 Lê Lợi, Quận 1, TP.HCM',
    service: 'Tắm & Làm đẹp toàn thân',
    serviceType: 'grooming',
    pet: 'Miu Miu',
    petAvatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop',
    checkIn: '15/02/2026',
    checkOut: '15/02/2026',
    time: '02:00 CH',
    status: 'Hoàn thành',
    image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?q=80&w=2070&auto=format&fit=crop',
    price: '350.000đ',
    rating: 5,
  },
];

/* ─── HELPERS ────────────────────────────────────────────────────────── */
const STATUS_STYLE: Record<Status, string> = {
  'Đang lưu trú': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'Sắp tới': 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
  'Hoàn thành': 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300',
  'Đã huỷ': 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-300',
};

function ServiceIcon({ type }: { type: ServiceType }) {
  if (type === 'boarding') return <Home className="w-4 h-4" />;
  if (type === 'grooming') return <Scissors className="w-4 h-4" />;
  return <Stethoscope className="w-4 h-4" />;
}

function StatusIcon({ status }: { status: Status }) {
  if (status === 'Hoàn thành') return <CheckCircle className="w-3.5 h-3.5" />;
  if (status === 'Đã huỷ') return <XCircle className="w-3.5 h-3.5" />;
  if (status === 'Đang lưu trú') return <Wifi className="w-3.5 h-3.5" />;
  return <AlertCircle className="w-3.5 h-3.5" />;
}

function StarRating({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= n ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
      ))}
    </div>
  );
}

const TAB_FILTERS: { label: string; value: Status | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang lưu trú', value: 'Đang lưu trú' },
  { label: 'Sắp tới', value: 'Sắp tới' },
  { label: 'Hoàn thành', value: 'Hoàn thành' },
];

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────── */
export default function BookingHistory() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Status | 'all'>('all');

  const filtered = activeTab === 'all'
    ? BOOKINGS
    : BOOKINGS.filter(b => b.status === activeTab);

  return (
    <div className=" flex-1 flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">        <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch đặt dịch vụ</h1>
        <p className="text-slate-500 mt-1">Quản lý tất cả lịch hẹn và dịch vụ thú cưng của bạn.</p>
      </div>
      <Link
                                  to="/search">
        <button className="flex items-center gap-2 bg-[#122143] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#122143]/20 hover:-translate-y-0.5 transition-all">
          <Plus className="w-5 h-5" /> Đặt dịch vụ mới
        </button>
      </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-2 border-b border-slate-100 dark:border-slate-700 overflow-x-auto scrollbar-hide">        {TAB_FILTERS.map(t => (
        <button
          key={t.value}
          onClick={() => setActiveTab(t.value)}
          className={`pb-4 px-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === t.value
            ? 'text-[#122143] dark:text-white border-[#122143] dark:border-white'
            : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
            }`}
        >
          {t.label}
          {t.value !== 'all' && (
            <span className={`ml-1.5 text-[10px] font-black ${activeTab === t.value ? 'opacity-100' : 'opacity-50'}`}>
              ({BOOKINGS.filter(b => b.status === t.value).length})
            </span>
          )}
        </button>
      ))}
      </div>

      {/* Cards */}
      <div className="grid gap-6">
        {filtered.map((booking) => (
          <div
            key={booking.id}
            className={`bg-white dark:bg-slate-800 rounded-3xl border overflow-hidden shadow-sm flex flex-col md:flex-row transition-shadow hover:shadow-md
              ${booking.status === 'Đang lưu trú'
                ? 'border-emerald-200 dark:border-emerald-500/30 shadow-emerald-100 dark:shadow-emerald-900/20'
                : 'border-slate-100 dark:border-slate-700'
              }`}
          >
            {/* Image */}
            <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0">
              <img src={booking.image} alt={booking.clinic} className="w-full h-full object-cover" />
              {/* Service type badge */}
              <div className={`absolute top-3 left-3 flex items-center gap-1.5 text-white text-[10px] font-black px-2.5 py-1 rounded-full
                ${booking.serviceType === 'boarding' ? 'bg-emerald-600' : booking.serviceType === 'grooming' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                <ServiceIcon type={booking.serviceType} />
                {booking.serviceType === 'boarding' ? 'LƯU TRÚ' : booking.serviceType === 'grooming' ? 'SPA' : 'KHÁM THÚ Y'}
              </div>
              {/* LIVE pulse for active boarding */}
              {booking.cameraEnabled && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full animate-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4">
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${STATUS_STYLE[booking.status]}`}>
                      <StatusIcon status={booking.status} />
                      {booking.status}
                    </span>
                    <span className="text-slate-400 text-xs font-bold">#{booking.id}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{booking.clinic}</h3>
                  <p className="text-slate-500 text-sm font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" /> {booking.address}
                  </p>
                </div>
                {/* Pet avatar */}
                <div className="flex items-center gap-2 shrink-0">
                  <img src={booking.petAvatar} alt={booking.pet}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow" />
                  <span className="text-xs font-bold text-slate-500 hidden sm:block">{booking.pet}</span>
                </div>
              </div>

              {/* Service detail */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                  ${booking.serviceType === 'boarding' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : booking.serviceType === 'grooming' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                  <ServiceIcon type={booking.serviceType} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{booking.service}</p>
                  {booking.room && (
                    <p className="text-[11px] text-slate-500 font-medium">{booking.room}</p>
                  )}
                </div>
                <span className="text-sm font-black text-[#122143] dark:text-[#2dd4bf] shrink-0">{booking.price}</span>
              </div>

              {/* Meta row + Actions */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-slate-50 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {booking.checkIn === booking.checkOut ? booking.checkIn : `${booking.checkIn} → ${booking.checkOut}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">{booking.time}</span>
                </div>
                {booking.rating !== undefined && <StarRating n={booking.rating} />}

                {/* Actions */}
                <div className="ml-auto flex items-center gap-2 flex-wrap">
                  {booking.cameraEnabled && (
                    <Link
                      to="/camera"
                      className="inline-flex items-center gap-2 bg-[#2dd4bf] hover:bg-[#26b8a5] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-[#2dd4bf]/30 hover:scale-105 transition-all"
                    >
                      <Video className="w-4 h-4" />
                      Xem Camera
                    </Link>
                  )}
                  {booking.status === 'Sắp tới' && (
                    <button className="inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                      <Phone className="w-3.5 h-3.5" /> Liên hệ
                    </button>
                  )}
                  <Link
                    to="/clinic/1"
                    className="inline-flex items-center gap-1 text-[#122143] dark:text-[#2dd4bf] font-bold text-sm hover:underline"
                  >
                    Chi tiết <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-24 text-slate-400">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="font-bold text-lg">Chưa có lịch nào</p>
            <p className="text-sm mt-1">Đặt dịch vụ đầu tiên cho bé yêu của bạn nhé!</p>
          </div>
        )}
      </div>
    </div>
  );
}
