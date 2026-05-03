import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import toast from 'react-hot-toast';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePaymentResult = async () => {
      const status = searchParams.get('status');
      const bookingId = searchParams.get('bookingId');
      const errorMessage = searchParams.get('message');

      if (status === 'success' && bookingId) {
        try {
          // Verify the payment and get booking details
          const booking = await bookingService.getById(parseInt(bookingId));
          // Navigate to success page with booking data
          navigate('/booking/success', {
            state: {
              booking,
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
                date: new Date(booking.appointmentDatetime).toLocaleDateString('vi-VN'),
                time: new Date(booking.appointmentDatetime).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }
            },
            replace: true
          });
        } catch (error) {
          console.error('Error verifying payment:', error);
          navigate('/payment/failure', {
            state: { error: 'Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.' },
            replace: true
          });
        }
      } else if (status === 'failed' || errorMessage) {
        navigate('/payment/failure', {
          state: { error: errorMessage || 'Thanh toán thất bại.' },
          replace: true
        });
      } else {
        // Invalid or missing parameters
        navigate('/payment/failure', {
          state: { error: 'Thông tin thanh toán không hợp lệ.' },
          replace: true
        });
      }
    };

    handlePaymentResult();
  }, [searchParams, navigate]);

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2b4c] mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Đang xử lý kết quả thanh toán...</p>
      </div>
    </div>
  );
}