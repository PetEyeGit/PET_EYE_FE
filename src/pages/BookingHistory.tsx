import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar, Clock, MapPin, Plus, Home, Stethoscope, Scissors,
  Video, Star, CheckCircle, AlertCircle, XCircle, Wifi, Loader2,
  ChevronRight, MessageCircle, Phone, RefreshCw, Sparkles,
} from 'lucide-react';
import { bookingService } from '../services/booking.service';
import type { BookingResponse } from '../types/api';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type TabKey = 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled';

function getTabKey(b: BookingResponse): TabKey {
  const s = b.status;
  if (s === 'CANCELLED' || s === 'PENDING_PAYMENT') return 'cancelled';
  if (s === 'COMPLETED') return 'completed';
  if (s === 'IN_PROGRESS') return 'active';
  return 'upcoming'; // CONFIRMED
}

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300', dot: 'bg-amber-400' },
  CONFIRMED:       { label: 'Sắp tới',         color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',   dot: 'bg-blue-500' },
  IN_PROGRESS:     { label: 'Đang diễn ra',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300', dot: 'bg-emerald-500' },
  COMPLETED:       { label: 'Hoàn thành',      color: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300',  dot: 'bg-slate-400' },
  CANCELLED:       { label: 'Đã huỷ',          color: 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-300',       dot: 'bg-red-400' },
};

function guessCategory(serviceName: string): 'boarding' | 'grooming' | 'clinic' {
  const n = serviceName.toLowerCase();
  if (n.includes('lưu trú') || n.includes('boarding') || n.includes('trông')) return 'boarding';
  if (n.includes('spa') || n.includes('tắm') || n.includes('cắt') || n.includes('grooming')) return 'grooming';
  return 'clinic';
}

const CATEGORY_META = {
  boarding: { label: 'LƯU TRÚ', bg: 'bg-emerald-600', icon: <Home className="w-3.5 h-3.5" />, iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
  grooming: { label: 'SPA & LÀM ĐẸP', bg: 'bg-purple-600', icon: <Scissors className="w-3.5 h-3.5" />, iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
  clinic:   { label: 'THÚ Y', bg: 'bg-blue-600', icon: <Stethoscope className="w-3.5 h-3.5" />, iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
};

const SHOP_IMAGES: Record<string, string> = {};
function getShopImage(shopName: string) {
  if (SHOP_IMAGES[shopName]) return SHOP_IMAGES[shopName];
  const seeds = ['pet-shop', 'veterinary', 'grooming', 'animal-care', 'pet-clinic'];
  const idx = shopName.charCodeAt(0) % seeds.length;
  return `https://images.unsplash.com/photo-${['1548199973-03cce0bbc87b', '1516734212186-a967f81ad0d7', '1535268647677-300dbf3d78d1', '1587300003388-59208cc962cb', '1450778869180-41d0601e046e'][idx]}?q=80&w=600&auto=format&fit=crop`;
}

const PET_COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ec4899', '#10b981', '#3b82f6'];
function petColor(name: string) {
  return PET_COLORS[name.charCodeAt(0) % PET_COLORS.length];
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function formatDate(iso: string) {
  try { return format(parseISO(iso), 'dd/MM/yyyy', { locale: vi }); } catch { return iso; }
}
function formatTime(iso: string) {
  try { return format(parseISO(iso), 'HH:mm', { locale: vi }); } catch { return ''; }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}`} />
      ))}
    </div>
  );
}

function PetBadge({ name }: { name: string }) {
  const color = petColor(name);
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ borderColor: color + '40', backgroundColor: color + '15' }}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[11px] font-bold" style={{ color }}>{name}</span>
    </div>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({ booking, onCancel, cancelling }: {
  booking: BookingResponse;
  onCancel: (id: number) => void;
  cancelling: boolean;
}) {
  const category = guessCategory(booking.serviceName);
  const catMeta = CATEGORY_META[category];
  const statusMeta = STATUS_META[booking.status] ?? STATUS_META.CONFIRMED;
  const isActive = booking.status === 'IN_PROGRESS';
  const isUpcoming = booking.status === 'CONFIRMED';
  const isCancelled = booking.status === 'CANCELLED' || booking.status === 'PENDING_PAYMENT';
  const isCompleted = booking.status === 'COMPLETED';

  return (
    <div className={`group bg-white dark:bg-slate-800/80 rounded-3xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300
      ${isActive ? 'border-emerald-200 dark:border-emerald-500/40 shadow-emerald-50 dark:shadow-emerald-900/10' : 'border-slate-100 dark:border-slate-700/60'}`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Left: Shop image */}
        <div className="relative w-full sm:w-48 h-44 sm:h-auto shrink-0 overflow-hidden">
          <img
            src={getShopImage(booking.shopName)}
            alt={booking.shopName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Category badge */}
          <div className={`absolute top-3 left-3 flex items-center gap-1.5 text-white text-[10px] font-black px-2.5 py-1 rounded-full ${catMeta.bg}`}>
            {catMeta.icon}
            {catMeta.label}
          </div>
          {/* LIVE badge for active */}
          {isActive && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              LIVE
            </div>
          )}
          {/* Overlay for cancelled */}
          {isCancelled && (
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
              <span className="text-white text-xs font-black bg-red-600/80 px-3 py-1 rounded-full">ĐÃ HUỶ</span>
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="flex-1 p-5 flex flex-col gap-3 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Status + ID */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusMeta.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                  {statusMeta.label}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-bold font-mono">#{booking.id}</span>
              </div>
              {/* Shop name */}
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight truncate">{booking.shopName}</h3>
            </div>

            {/* Pet badge — prominent */}
            <div className="shrink-0">
              <PetBadge name={booking.petName} />
            </div>
          </div>

          {/* Service row */}
          <div className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-50 dark:bg-slate-700/40'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${catMeta.iconBg}`}>
              {catMeta.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{booking.serviceName}</p>
              {booking.staffName && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Nhân viên: {booking.staffName}
                </p>
              )}
            </div>
            <span className="text-sm font-black text-[#122143] dark:text-teal-400 shrink-0">
              {formatVND(booking.servicePrice)}
            </span>
          </div>

          {/* Date + time */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-bold">{formatDate(booking.appointmentDatetime)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-bold">{formatTime(booking.appointmentDatetime)}</span>
            </div>
            {isCompleted && <StarRating n={5} />}
          </div>

          {/* Note */}
          {booking.note && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-700/30 rounded-xl px-3 py-2 line-clamp-2">
              "{booking.note}"
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-50 dark:border-slate-700/50 mt-auto">
            {isActive && (
              <Link
                to="/camera"
                className="inline-flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md shadow-teal-500/30 hover:scale-105 transition-all"
              >
                <Video className="w-3.5 h-3.5" /> Xem Camera
              </Link>
            )}
            {isUpcoming && (
              <button
                onClick={() => onCancel(booking.id)}
                disabled={cancelling}
                className="inline-flex items-center gap-1.5 border border-red-200 dark:border-red-500/30 text-red-500 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
              >
                {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Huỷ lịch
              </button>
            )}
            <Link
              to="/messages"
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Nhắn tin
            </Link>
            <Link
              to={`/clinic/${booking.shopId}`}
              className="ml-auto inline-flex items-center gap-1 text-[#122143] dark:text-teal-400 font-bold text-xs hover:underline"
            >
              Chi tiết <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabKey }) {
  const msgs: Record<TabKey, { icon: React.ReactNode; title: string; sub: string }> = {
    all:       { icon: <Calendar className="w-12 h-12 opacity-30" />, title: 'Chưa có lịch hẹn nào', sub: 'Đặt dịch vụ đầu tiên cho bé yêu của bạn nhé!' },
    upcoming:  { icon: <AlertCircle className="w-12 h-12 opacity-30" />, title: 'Không có lịch sắp tới', sub: 'Tất cả lịch hẹn đã được xử lý.' },
    active:    { icon: <Wifi className="w-12 h-12 opacity-30" />, title: 'Không có dịch vụ đang diễn ra', sub: 'Khi thú cưng đang được chăm sóc, bạn sẽ thấy ở đây.' },
    completed: { icon: <CheckCircle className="w-12 h-12 opacity-30" />, title: 'Chưa có lịch hoàn thành', sub: 'Lịch sử dịch vụ sẽ xuất hiện sau khi hoàn tất.' },
    cancelled: { icon: <XCircle className="w-12 h-12 opacity-30" />, title: 'Không có lịch đã huỷ', sub: 'Tuyệt vời! Bạn chưa huỷ lịch nào.' },
  };
  const m = msgs[tab];
  return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
      {m.icon}
      <p className="font-bold text-lg mt-4">{m.title}</p>
      <p className="text-sm mt-1">{m.sub}</p>
      {tab === 'all' && (
        <Link to="/search" className="mt-6 inline-flex items-center gap-2 bg-[#122143] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all text-sm">
          <Plus className="w-4 h-4" /> Đặt dịch vụ ngay
        </Link>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',       label: 'Tất cả' },
  { key: 'upcoming',  label: 'Sắp tới' },
  { key: 'active',    label: 'Đang diễn ra' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã huỷ' },
];

export default function BookingHistory() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const { data: bookings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: bookingService.getMyBookings,
    staleTime: 30_000,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingService.cancel(id),
    onMutate: (id) => setCancellingId(id),
    onSuccess: () => {
      toast.success('Đã huỷ lịch hẹn');
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: () => toast.error('Không thể huỷ lịch. Vui lòng thử lại.'),
    onSettled: () => setCancellingId(null),
  });

  // Sort: newest first
  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filtered = activeTab === 'all' ? sorted : sorted.filter(b => getTabKey(b) === activeTab);

  // Count per tab
  const counts: Record<TabKey, number> = {
    all: sorted.length,
    upcoming: sorted.filter(b => getTabKey(b) === 'upcoming').length,
    active: sorted.filter(b => getTabKey(b) === 'active').length,
    completed: sorted.filter(b => getTabKey(b) === 'completed').length,
    cancelled: sorted.filter(b => getTabKey(b) === 'cancelled').length,
  };

  // Summary stats
  const totalSpent = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((s, b) => s + b.servicePrice, 0);

  const uniquePets = [...new Set(bookings.map(b => b.petName))];

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Lịch đặt dịch vụ</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Quản lý tất cả lịch hẹn và dịch vụ thú cưng của bạn.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link to="/search">
            <button className="flex items-center gap-2 bg-[#122143] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-[#122143]/20 hover:-translate-y-0.5 transition-all text-sm">
              <Plus className="w-4 h-4" /> Đặt dịch vụ mới
            </button>
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tổng lịch hẹn', value: bookings.length, icon: <Calendar className="w-4 h-4" />, color: 'text-[#122143] dark:text-teal-400' },
            { label: 'Đang diễn ra', value: counts.active, icon: <Wifi className="w-4 h-4" />, color: 'text-emerald-600' },
            { label: 'Thú cưng', value: uniquePets.length, icon: <Sparkles className="w-4 h-4" />, color: 'text-purple-600' },
            { label: 'Đã chi tiêu', value: formatVND(totalSpent), icon: <CheckCircle className="w-4 h-4" />, color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className={`text-base font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-400 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pet filter chips */}
      {uniquePets.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thú cưng:</span>
          {uniquePets.map(name => <PetBadge key={name} name={name} />)}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-100 dark:border-slate-700 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3.5 px-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === t.key
                ? 'text-[#122143] dark:text-white border-[#122143] dark:border-white'
                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeTab === t.key
                  ? 'bg-[#122143] text-white dark:bg-white dark:text-[#122143]'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-[#122143]" />
          <p className="font-bold">Đang tải lịch hẹn...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="font-bold text-red-500">Không thể tải dữ liệu</p>
          <button onClick={() => refetch()} className="text-sm text-[#122143] dark:text-teal-400 font-bold hover:underline flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className="grid gap-4">
          {filtered.map(b => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancel={(id) => cancelMutation.mutate(id)}
              cancelling={cancellingId === b.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
