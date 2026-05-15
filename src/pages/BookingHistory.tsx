import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar, Clock, Plus, Home, Stethoscope, Scissors,
  Video, Star, CheckCircle, AlertCircle, XCircle, Wifi, Loader2,
  ChevronRight, MessageCircle, RefreshCw, Sparkles,
  Search, ArrowUpRight, Wallet, Heart, Info, X
} from 'lucide-react';
import { bookingService } from '../services/booking.service';
import { reviewService } from '../services/review.service';
import type { BookingResponse } from '../types/api';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

// ─── Helpers & Meta ──────────────────────────────────────────────────────────

type TabKey = 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled';

function getTabKey(b: BookingResponse): TabKey {
  const s = b.status;
  if (s === 'CANCELLED' || s === 'PENDING_PAYMENT') return 'cancelled';
  if (s === 'COMPLETED') return 'completed';
  if (s === 'IN_PROGRESS') return 'active';
  return 'upcoming'; 
}

const STATUS_META: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', bg: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-600', icon: Info },
  CONFIRMED:       { label: 'Sắp diễn ra',   bg: 'bg-blue-100 dark:bg-blue-500/10',   text: 'text-blue-600',   icon: Calendar },
  IN_PROGRESS:     { label: 'Đang thực hiện', bg: 'bg-emerald-100 dark:bg-emerald-500/10', text: 'text-emerald-600', icon: Wifi },
  COMPLETED:       { label: 'Hoàn tất',      bg: 'bg-slate-100 dark:bg-slate-800',     text: 'text-slate-500',  icon: CheckCircle },
  CANCELLED:       { label: 'Đã hủy lịch',   bg: 'bg-rose-100 dark:bg-rose-500/10',   text: 'text-rose-600',   icon: XCircle },
};

function guessCategory(serviceName: string): 'boarding' | 'grooming' | 'clinic' {
  const n = serviceName.toLowerCase();
  if (n.includes('lưu trú') || n.includes('boarding') || n.includes('trông')) return 'boarding';
  if (n.includes('spa') || n.includes('tắm') || n.includes('cắt') || n.includes('grooming')) return 'grooming';
  return 'clinic';
}

const CATEGORY_META = {
  boarding: { label: 'Boarding', icon: Home, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  grooming: { label: 'Grooming', icon: Scissors, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  clinic:   { label: 'Clinic',   icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
};

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',       label: 'Tất cả' },
  { key: 'upcoming',  label: 'Sắp tới' },
  { key: 'active',    label: 'Đang diễn ra' },
  { key: 'completed', label: 'Lịch sử' },
  { key: 'cancelled', label: 'Đã huỷ' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, delay }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none flex flex-col gap-4 relative overflow-hidden group"
        >
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-inner`}>
                <Icon size={22} className="text-white" />
            </div>
            <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        </motion.div>
    );
}

function BookingItem({ booking, onCancel, cancelling, onReview }: any) {
    const category = guessCategory(booking.serviceName);
    const cat = CATEGORY_META[category];
    const status = STATUS_META[booking.status] || STATUS_META.CONFIRMED;
    const isLive = booking.status === 'IN_PROGRESS';

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="group bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row gap-8 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden"
        >
            {/* Left: Visual & Category */}
            <div className="w-full md:w-56 h-48 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0">
                <img 
                    src={`https://images.unsplash.com/photo-${booking.id % 2 === 0 ? '1548199973-03cce0bbc87b' : '1516734212186-a967f81ad0d7'}?auto=format&fit=crop&q=80&w=400`} 
                    alt="shop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full ${cat.bg} backdrop-blur-md flex items-center gap-2 border border-white/20`}>
                    <cat.icon size={12} className={cat.color} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${cat.color}`}>{cat.label}</span>
                </div>
                {isLive && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-lg animate-pulse flex items-center gap-1">
                        <div className="w-1 h-1 bg-white rounded-full" /> LIVE
                    </div>
                )}
                <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">ID Đơn</p>
                    <p className="text-sm font-black tracking-tight">#{booking.id.toString().padStart(5, '0')}</p>
                </div>
            </div>

            {/* Middle: Core Info */}
            <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-primary transition-colors">
                            {booking.shopName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`px-3 py-1 rounded-full ${status.bg} ${status.text} text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                                <status.icon size={12} /> {status.label}
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dành cho: {booking.petName}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-black text-slate-900 dark:text-white">{formatVND(booking.servicePrice)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trọn gói dịch vụ</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-sm">
                            <cat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dịch vụ</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{booking.serviceName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-sm">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {format(parseISO(booking.appointmentDatetime), 'dd/MM/yyyy • HH:mm', { locale: vi })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                        {isLive && (
                            <Link to="/camera" className="px-5 py-2.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                                <Video size={14} /> Xem Camera
                            </Link>
                        )}
                        {booking.status === 'COMPLETED' && (
                            <button onClick={() => onReview(booking)} className="px-5 py-2.5 bg-amber-400 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-400/20 hover:scale-105 transition-all">
                                <Star size={14} className="fill-current" /> Đánh giá
                            </button>
                        )}
                        <Link to="/messages" className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                            <MessageCircle size={14} /> Nhắn tin
                        </Link>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {booking.status === 'CONFIRMED' && (
                            <button 
                                onClick={() => onCancel(booking.id)} disabled={cancelling}
                                className="px-5 py-2.5 border border-rose-100 dark:border-rose-900/30 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center gap-2"
                            >
                                {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Hủy lịch
                            </button>
                        )}
                        <Link to={`/clinic/${booking.shopId}`} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                            <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function BookingHistory() {
    const qc = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    // Review state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    const handleOpenReview = (booking: BookingResponse) => {
        setSelectedBooking(booking);
        setRating(5);
        setComment('');
        setShowReviewModal(true);
    };

    const handleSubmitReview = async () => {
        if (!selectedBooking) return;
        if (!comment.trim()) {
            toast.error('Vui lòng nhập nhận xét');
            return;
        }

        try {
            setSubmitting(true);
            await reviewService.createReview({
                shopId: selectedBooking.shopId,
                bookingId: selectedBooking.id,
                rating,
                comment
            });
            toast.success('Đánh giá của bạn đã được gửi!');
            setShowReviewModal(false);
            refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    const sorted = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const filtered = activeTab === 'all' ? sorted : sorted.filter(b => getTabKey(b) === activeTab);

    const counts: Record<TabKey, number> = {
        all: sorted.length,
        upcoming: sorted.filter(b => getTabKey(b) === 'upcoming').length,
        active: sorted.filter(b => getTabKey(b) === 'active').length,
        completed: sorted.filter(b => getTabKey(b) === 'completed').length,
        cancelled: sorted.filter(b => getTabKey(b) === 'cancelled').length,
    };

    const totalSpent = bookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + b.servicePrice, 0);
    const activePets = [...new Set(bookings.filter(b => b.status !== 'CANCELLED').map(b => b.petName))].length;

    if (isLoading) return (
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
                <Loader2 className="absolute inset-0 m-auto text-primary animate-pulse" size={24} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Đang đồng bộ lịch hẹn...</p>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col gap-10 p-4 md:p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Calendar size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Lịch sử đặt chỗ</h1>
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.2em] ml-1">Quản lý sức khỏe & Làm đẹp cho thú cưng</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => refetch()} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary transition-all">
                        <RefreshCw size={20} />
                    </button>
                    <Link to="/search" className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
                        <Plus size={20} /> Đặt dịch vụ mới
                    </Link>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Tổng đơn hàng" value={counts.all} icon={Calendar} color="bg-indigo-500" delay={0.1} />
                <StatCard label="Đang diễn ra" value={counts.active} icon={Wifi} color="bg-emerald-500" delay={0.2} />
                <StatCard label="Thú cưng" value={activePets} icon={Heart} color="bg-rose-500" delay={0.3} />
                <StatCard label="Tổng chi tiêu" value={formatVND(totalSpent)} icon={Wallet} color="bg-amber-500" delay={0.4} />
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 w-fit">
                {TABS.map(tab => (
                    <button 
                        key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${activeTab === tab.key ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab.label}
                        {counts[tab.key] > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-lg text-[9px] ${activeTab === tab.key ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                {counts[tab.key]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* List Section */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-slate-800 p-24 text-center"
                        >
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Không tìm thấy lịch hẹn</h3>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto">Chúng tôi không tìm thấy bất kỳ lịch hẹn nào trong mục này. Hãy thử chọn danh mục khác!</p>
                        </motion.div>
                    ) : (
                        filtered.map(b => (
                            <BookingItem 
                                key={b.id} 
                                booking={b} 
                                onCancel={(id: number) => cancelMutation.mutate(id)}
                                cancelling={cancellingId === b.id}
                                onReview={handleOpenReview}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {showReviewModal && selectedBooking && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowReviewModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white/10"
                        >
                            <div className="bg-amber-400 p-8 text-slate-900 relative">
                                <Sparkles className="absolute top-4 right-4 text-white/40" size={60} />
                                <h2 className="text-2xl font-black tracking-tight">Đánh giá trải nghiệm</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Cảm ơn bạn đã tin tưởng hệ thống</p>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">{selectedBooking.serviceName}</p>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedBooking.shopName}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-center text-sm font-bold text-slate-500">Mức độ hài lòng của bạn?</p>
                                    <div className="flex justify-center gap-3">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button key={star} onClick={() => setRating(star)} className="transition-transform active:scale-90">
                                                <Star size={40} className={`${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'} transition-all`} />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-center text-xs font-black text-amber-500 uppercase tracking-widest">
                                        {['Rất tệ', 'Tạm được', 'Bình thường', 'Rất tốt', 'Tuyệt vời'][rating-1]}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Chia sẻ chi tiết</label>
                                    <textarea 
                                        value={comment} onChange={e => setComment(e.target.value)}
                                        placeholder="Bạn cảm thấy thế nào về bác sĩ và cơ sở vật chất?"
                                        className="w-full h-32 px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-4 focus:ring-amber-400/20 outline-none font-bold text-sm text-slate-700 dark:text-white transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setShowReviewModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Hủy bỏ</button>
                                    <button 
                                        onClick={handleSubmitReview} disabled={submitting}
                                        className="flex-[2] py-4 bg-amber-400 text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
                                    >
                                        {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Gửi đánh giá ngay'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
