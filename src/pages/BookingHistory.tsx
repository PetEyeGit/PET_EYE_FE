import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, Clock, MapPin, ChevronRight,
  Plus, Home, Stethoscope, Scissors, Video,
  Star, Phone, CheckCircle, AlertCircle, XCircle, Wifi, MessageCircle
} from 'lucide-react';
import { bookingService } from '../services/booking.service';
import { reviewService } from '../services/review.service';
import { BookingResponse } from '../types/api';
import toast from 'react-hot-toast';

/* ─── TYPES ─────────────────────────────────────────────────────────── */
type Status = 'Đang lưu trú' | 'Sắp tới' | 'Hoàn thành' | 'Đã huỷ';
type ServiceType = 'boarding' | 'grooming' | 'clinic';

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
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Không thể tải lịch sử đặt lịch');
    } finally {
      setLoading(false);
    }
  };

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
      fetchBookings(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status: string): Status => {
    if (status === 'COMPLETED') return 'Hoàn thành';
    if (status === 'CANCELLED') return 'Đã huỷ';
    if (status === 'CONFIRMED') return 'Sắp tới';
    return 'Đang lưu trú';
  };

  const filtered = activeTab === 'all'
    ? bookings
    : bookings.filter(b => getStatusLabel(b.status) === activeTab);

  const getServiceType = (serviceName: string): ServiceType => {
    const lower = serviceName.toLowerCase();
    if (lower.includes('lưu trú') || lower.includes('boarding')) return 'boarding';
    if (lower.includes('spa') || lower.includes('cắt tỉa') || lower.includes('grooming')) return 'grooming';
    return 'clinic';
  };

  return (
    <div className=" flex-1 flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Lịch đặt dịch vụ</h1>
          <p className="text-slate-500 mt-1">Quản lý tất cả lịch hẹn và dịch vụ thú cưng của bạn.</p>
        </div>
        <Link to="/search">
          <button className="flex items-center gap-2 bg-[#122143] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#122143]/20 hover:-translate-y-0.5 transition-all">
            <Plus className="w-5 h-5" /> Đặt dịch vụ mới
          </button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-2 border-b border-slate-100 dark:border-slate-700 overflow-x-auto scrollbar-hide">
        {TAB_FILTERS.map(t => (
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
                ({bookings.filter(b => getStatusLabel(b.status) === t.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="size-12 border-4 border-[#122143] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold">Đang tải lịch sử...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="font-bold text-lg">Chưa có lịch nào</p>
            <p className="text-sm mt-1">Đặt dịch vụ đầu tiên cho bé yêu của bạn nhé!</p>
          </div>
        ) : (
          filtered.map((booking) => {
            const status = getStatusLabel(booking.status);
            const serviceType = getServiceType(booking.serviceName);
            return (
              <div
                key={booking.id}
                className={`bg-white dark:bg-slate-800 rounded-3xl border overflow-hidden shadow-sm flex flex-col md:flex-row transition-shadow hover:shadow-md
              ${status === 'Đang lưu trú'
                    ? 'border-emerald-200 dark:border-emerald-500/30 shadow-emerald-100 dark:shadow-emerald-900/20'
                    : 'border-slate-100 dark:border-slate-700'
                  }`}
              >
                {/* Image */}
                <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0">
                  <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop" alt={booking.shopName} className="w-full h-full object-cover" />
                  {/* Service type badge */}
                  <div className={`absolute top-3 left-3 flex items-center gap-1.5 text-white text-[10px] font-black px-2.5 py-1 rounded-full
                ${serviceType === 'boarding' ? 'bg-emerald-600' : serviceType === 'grooming' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                    <ServiceIcon type={serviceType} />
                    {serviceType === 'boarding' ? 'LƯU TRÚ' : serviceType === 'grooming' ? 'SPA' : 'KHÁM THÚ Y'}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${STATUS_STYLE[status]}`}>
                          <StatusIcon status={status} />
                          {status}
                        </span>
                        <span className="text-slate-400 text-xs font-bold">#{booking.id}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{booking.shopName}</h3>
                      <p className="text-slate-500 text-sm font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" /> Cơ sở PetEye
                      </p>
                    </div>
                    {/* Pet avatar */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white dark:border-slate-700 shadow">
                        {booking.petName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-500 hidden sm:block">{booking.petName}</span>
                    </div>
                  </div>

                  {/* Service detail */}
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                  ${serviceType === 'boarding' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : serviceType === 'grooming' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                      <ServiceIcon type={serviceType} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{booking.serviceName}</p>
                    </div>
                    <span className="text-sm font-black text-[#122143] dark:text-[#2dd4bf] shrink-0">{booking.servicePrice.toLocaleString('vi-VN')}đ</span>
                  </div>

                  {/* Meta row + Actions */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-slate-50 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {new Date(booking.appointmentDatetime).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {new Date(booking.appointmentDatetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="ml-auto flex items-center gap-2 flex-wrap">
                      {status === 'Hoàn thành' && (
                        <button
                          onClick={() => handleOpenReview(booking)}
                          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-[#122143] text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-amber-200 transition-all"
                        >
                          <Star className="w-4 h-4 fill-current" />
                          Đánh giá ngay
                        </button>
                      )}
                      {status === 'Sắp tới' && (
                        <button className="inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                          <Phone className="w-3.5 h-3.5" /> Liên hệ
                        </button>
                      )}
                      <Link
                        to="/messages"
                        className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-[#122143] dark:text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Nhắn tin
                      </Link>
                      <Link
                        to={`/clinic/${booking.shopId}`}
                        className="inline-flex items-center gap-1 text-[#122143] dark:text-[#2dd4bf] font-bold text-sm hover:underline"
                      >
                        Chi tiết <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Đánh giá dịch vụ</h3>
                <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Dịch vụ đã dùng</p>
                <p className="text-sm font-black text-[#122143] dark:text-white">{selectedBooking.serviceName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Tại {selectedBooking.shopName}</p>
              </div>

              <div className="flex flex-col items-center gap-4 mb-8">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Bạn thấy thế nào về trải nghiệm này?</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        size={40}
                        className={`${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-black text-amber-500 uppercase tracking-widest">
                  {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Tạm được' : 'Kém'}
                </p>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nhận xét của bạn</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ và bác sĩ..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none h-32"
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="w-full py-4 bg-[#122143] text-white rounded-2xl font-black shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
