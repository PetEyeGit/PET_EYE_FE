import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/booking.service';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentResult = async () => {
      // PayOS redirect params: ?code=00&id=xxx&cancel=false&status=PAID&orderCode=xxx
      const code      = searchParams.get('code');      // '00' = success
      const status    = searchParams.get('status');    // 'PAID' | 'CANCELLED'
      const orderCode = searchParams.get('orderCode');
      const cancel    = searchParams.get('cancel');    // 'true' | 'false'

      // ── Bị huỷ ───────────────────────────────────────────────────────────
      if (cancel === 'true' || status === 'CANCELLED') {
        // Dọn localStorage nếu có
        localStorage.removeItem('pendingCashDeposit');
        navigate('/payment/failure', {
          state: { error: 'Bạn đã huỷ thanh toán. Lịch hẹn chưa được tạo.' },
          replace: true
        });
        return;
      }

      // ── Thiếu orderCode ───────────────────────────────────────────────────
      if (!orderCode) {
        navigate('/payment/failure', {
          state: { error: 'Thông tin thanh toán không hợp lệ (thiếu orderCode).' },
          replace: true
        });
        return;
      }

      // ── Thanh toán không thành công ───────────────────────────────────────
      if (code !== '00' || status !== 'PAID') {
        localStorage.removeItem('pendingCashDeposit');
        navigate('/payment/failure', {
          state: { error: `Thanh toán không thành công (code=${code}, status=${status}). Vui lòng thử lại.` },
          replace: true
        });
        return;
      }

      // ── Thanh toán thành công — xác định loại booking ─────────────────────
      // Dùng localStorage (persist qua redirect sang PayOS domain)
      const cashDepositOrderCode = localStorage.getItem('pendingCashDeposit');
      const isCashDeposit = cashDepositOrderCode === orderCode;

      try {
        let booking;
        if (isCashDeposit) {
          // Cash deposit: xác nhận cọc 10% → tạo booking
          localStorage.removeItem('pendingCashDeposit');
          booking = await bookingService.confirmCashDeposit(parseInt(orderCode));
        } else {
          // PayOS thường: xác nhận thanh toán đầy đủ → tạo booking
          booking = await bookingService.confirmPayment(parseInt(orderCode));
        }

        navigate('/booking/success', {
          state: {
            booking,
            isCashDeposit,
            bookingInfo: {
              shopId: booking.shopId,
              shopName: booking.shopName,
              serviceId: booking.serviceId,
              serviceName: booking.serviceName,
              servicePrice: booking.servicePrice,
              petId: booking.petId,
              petName: booking.petName,
              petNote: booking.note,
              staffId: booking.staffId,
              appointmentDatetime: booking.appointmentDatetime,
              date: new Date(booking.appointmentDatetime).toLocaleDateString('vi-VN', {
                weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'
              }),
              time: new Date(booking.appointmentDatetime).toLocaleTimeString('vi-VN', {
                hour: '2-digit', minute: '2-digit'
              })
            }
          },
          replace: true
        });
      } catch (error: any) {
        console.error('Error confirming payment:', error);
        const msg = error?.response?.data?.message
          || error?.message
          || 'Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.';
        navigate('/payment/failure', {
          state: { error: msg },
          replace: true
        });
      }
    };

    handlePaymentResult();
  }, [searchParams, navigate]);

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2b4c] mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Đang xác nhận thanh toán...</p>
        <p className="text-slate-400 text-sm mt-1">Vui lòng không đóng trang này</p>
      </div>
    </div>
  );
}