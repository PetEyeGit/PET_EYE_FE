import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BookingServiceItem {
  id: number;
  name: string;
  price: number;
}

export default function BookingSuccess() {
  const location = useLocation();
  const { booking, bookingInfo } = location.state || {};
  const confettiRef = useRef<HTMLDivElement>(null);

  // Simple confetti burst on mount
  useEffect(() => {
    const container = confettiRef.current;
    if (!container) return;
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6'];
    for (let i = 0; i < 48; i++) {
      const dot = document.createElement('div');
      const size = Math.random() * 8 + 4;
      dot.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        background:${colors[Math.floor(Math.random() * colors.length)]};
        left:${Math.random() * 100}%;
        top:-10px;
        opacity:1;
        transform:rotate(${Math.random() * 360}deg);
        animation:fall ${1.2 + Math.random() * 1.2}s ease-in ${Math.random() * 0.6}s forwards;
      `;
      container.appendChild(dot);
    }
    const style = document.createElement('style');
    style.textContent = `@keyframes fall{to{top:110%;opacity:0;transform:rotate(${Math.random()*720}deg) translateX(${(Math.random()-0.5)*80}px);}}`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  if (!booking || !bookingInfo) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-8">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">error</span>
          <p className="text-slate-500 font-semibold mb-4">Không có thông tin đặt lịch.</p>
          <Link to="/home" className="px-5 py-2.5 bg-[#1a2b4c] text-white font-bold rounded-xl hover:bg-[#243d6b] transition-colors">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Danh sách dịch vụ — dùng services[] nếu có, fallback về serviceName cũ
  const serviceList: BookingServiceItem[] = bookingInfo.services && bookingInfo.services.length > 0
    ? bookingInfo.services
    : [{ id: bookingInfo.serviceId ?? 0, name: bookingInfo.serviceName ?? '—', price: bookingInfo.servicePrice ?? 0 }];

  const totalPrice = serviceList.reduce((sum: number, s: BookingServiceItem) => sum + s.price, 0);

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 min-h-screen flex items-center justify-center p-4">

      {/* Confetti container */}
      <div ref={confettiRef} className="fixed inset-0 pointer-events-none overflow-hidden z-50" />

      <div className="max-w-lg w-full flex flex-col gap-4">

        {/* ── Hero card ── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-none overflow-hidden">

          {/* Top banner */}
          <div className="bg-gradient-to-r from-[#1a2b4c] to-indigo-600 px-6 pt-8 pb-10 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />

            {/* Animated checkmark */}
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center animate-[ping_1s_ease-out_1]">
                <div className="absolute w-20 h-20 bg-white/10 rounded-full" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-3xl text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-black text-white mb-1">Đặt lịch thành công!</h1>
            <p className="text-indigo-200 text-sm">Chúng tôi sẽ nhắc bạn trước giờ hẹn 🐾</p>

            {/* Booking ID badge */}
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-white/15 backdrop-blur rounded-full text-white text-xs font-bold">
              <span className="material-symbols-outlined text-sm">confirmation_number</span>
              Mã đặt lịch #{booking.id}
            </div>
          </div>

          {/* Shop info strip */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <div
              className="w-12 h-12 rounded-xl bg-cover bg-center shrink-0 bg-slate-100 dark:bg-slate-700"
              style={{ backgroundImage: bookingInfo.shopImage ? `url(${bookingInfo.shopImage})` : 'url(https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=200&auto=format&fit=crop)' }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{bookingInfo.shopName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-xs text-teal-500">location_on</span>
                {bookingInfo.shopAddress}
              </p>
            </div>
            <span className="shrink-0 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
              Đã xác nhận
            </span>
          </div>

          {/* Body */}
          <div className="px-5 py-5 flex flex-col gap-4">

            {/* Schedule section — tách riêng dịch vụ thường và lưu trú */}
            {(() => {
              // Parse date string để tách dịch vụ thường vs lưu trú
              // bookingInfo.date có thể là:
              // - "Thứ Ba, 19/05/2026" (chỉ dịch vụ thường)
              // - "Thứ Ba, 19/05/2026 | Lưu trú: 04/05/2026 → 05/05/2026" (cả 2)
              // - "Lưu trú: 04/05/2026 → 05/05/2026" (chỉ lưu trú)
              const dateStr: string = bookingInfo.date ?? '';
              const timeStr: string = bookingInfo.time ?? '';

              // Tách phần lưu trú nếu có
              const boardingMatch = dateStr.match(/Lưu trú:\s*(.+?)\s*→\s*(.+?)(?:\s*\|.*)?$/);
              // Tách phần dịch vụ thường (trước " | " hoặc toàn bộ nếu không có lưu trú)
              const normalDatePart = dateStr.includes('|')
                ? dateStr.split('|')[0].trim()
                : (!boardingMatch ? dateStr.trim() : '');

              const hasNormal = !!normalDatePart && !normalDatePart.startsWith('Lưu trú');
              const hasBoarding = !!boardingMatch;

              // time: nếu là "X ngày" thì là boarding duration, ngược lại là giờ dịch vụ thường
              const isBoardingTime = timeStr.includes('ngày');

              return (
                <div className="flex flex-col gap-3">
                  {/* Dịch vụ thường: ngày + giờ */}
                  {hasNormal && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="material-symbols-outlined text-base text-[#1a2b4c] dark:text-indigo-400">calendar_month</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày hẹn</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{normalDatePart}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="material-symbols-outlined text-base text-[#1a2b4c] dark:text-indigo-400">schedule</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giờ hẹn</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {!isBoardingTime ? timeStr : '—'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Lưu trú: check-in → check-out + số ngày */}
                  {hasBoarding && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800">
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="material-symbols-outlined text-base text-indigo-600 dark:text-indigo-400">hotel</span>
                        <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Lịch lưu trú</span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        {/* Check-in */}
                        <div className="bg-white dark:bg-indigo-900/40 rounded-xl p-3 text-center">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Nhận phòng</p>
                          <p className="text-sm font-black text-indigo-900 dark:text-indigo-100">{boardingMatch[1]}</p>
                          <p className="text-[10px] text-indigo-400 mt-0.5">12:00</p>
                        </div>
                        {/* Arrow + duration */}
                        <div className="flex flex-col items-center gap-1">
                          <span className="material-symbols-outlined text-indigo-400 text-xl">arrow_forward</span>
                          {isBoardingTime && (
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {timeStr}
                            </span>
                          )}
                        </div>
                        {/* Check-out */}
                        <div className="bg-white dark:bg-indigo-900/40 rounded-xl p-3 text-center">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Trả phòng</p>
                          <p className="text-sm font-black text-indigo-900 dark:text-indigo-100">{boardingMatch[2]}</p>
                          <p className="text-[10px] text-indigo-400 mt-0.5">12:00</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback nếu không parse được */}
                  {!hasNormal && !hasBoarding && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="material-symbols-outlined text-base text-[#1a2b4c] dark:text-indigo-400">calendar_month</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày hẹn</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{dateStr}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="material-symbols-outlined text-base text-[#1a2b4c] dark:text-indigo-400">schedule</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giờ / Thời gian</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{timeStr}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Pet */}
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl px-4 py-3">
              <span className="text-2xl">🐾</span>
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Thú cưng</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{bookingInfo.petName}</p>
              </div>
            </div>

            {/* Services list */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <span className="material-symbols-outlined text-base text-[#1a2b4c] dark:text-indigo-400">receipt_long</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Dịch vụ đã đặt ({serviceList.length})
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {serviceList.map((svc: BookingServiceItem, i: number) => (
                  <div key={svc.id || i} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm text-indigo-600 dark:text-indigo-400">
                          {svc.name.toLowerCase().includes('lưu trú') || svc.name.toLowerCase().includes('boarding')
                            ? 'hotel'
                            : svc.name.toLowerCase().includes('camera')
                              ? 'videocam'
                              : 'content_cut'}
                        </span>
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{svc.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white shrink-0">
                      {svc.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#1a2b4c] dark:bg-indigo-900/60">
                <span className="text-sm font-bold text-white/80">Tổng cộng</span>
                <span className="text-base font-black text-white">{totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Note */}
            {bookingInfo.petNote && (
              <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl px-4 py-3">
                <span className="material-symbols-outlined text-base text-slate-400 mt-0.5">sticky_note_2</span>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Ghi chú</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{bookingInfo.petNote}</p>
                </div>
              </div>
            )}

            {/* Reminder tip */}
            <div className="flex items-start gap-3 bg-teal-50 dark:bg-teal-900/20 rounded-2xl px-4 py-3 border border-teal-100 dark:border-teal-800">
              <span className="material-symbols-outlined text-base text-teal-600 dark:text-teal-400 mt-0.5">tips_and_updates</span>
              <p className="text-xs text-teal-700 dark:text-teal-300 leading-relaxed">
                Vui lòng đến trước <strong>15 phút</strong> để làm thủ tục. Nếu cần hủy, hãy thực hiện trước <strong>24 giờ</strong> để được hoàn tiền.
              </p>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/bookings/my"
            className="flex items-center justify-center gap-2 py-3.5 bg-[#1a2b4c] text-white font-bold rounded-2xl hover:bg-[#243d6b] transition-all shadow-lg shadow-[#1a2b4c]/20 text-sm"
          >
            <span className="material-symbols-outlined text-base">event_note</span>
            Lịch của tôi
          </Link>
          <Link
            to="/home"
            className="flex items-center justify-center gap-2 py-3.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm"
          >
            <span className="material-symbols-outlined text-base">home</span>
            Trang chủ
          </Link>
        </div>

        {/* Share / Add to calendar row */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-sm">ios_share</span>
            Chia sẻ
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-sm">calendar_add_on</span>
            Thêm vào lịch
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-sm">chat</span>
            Nhắn tin
          </button>
        </div>

      </div>
    </div>
  );
}
