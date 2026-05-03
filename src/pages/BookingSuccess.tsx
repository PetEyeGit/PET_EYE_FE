import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User, Phone } from 'lucide-react';

export default function BookingSuccess() {
  const location = useLocation();
  const { booking, bookingInfo } = location.state || {};

  if (!booking || !bookingInfo) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
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

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Đặt lịch thành công!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Lịch hẹn của bạn đã được xác nhận. Chúng tôi sẽ gửi thông báo qua email và SMS.
          </p>
        </div>

        {/* Booking Details */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Chi tiết lịch hẹn
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                  <span className="font-medium">Ngày:</span>
                  <span className="ml-2">{bookingInfo.date}</span>
                </div>
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 mr-2 text-slate-500" />
                  <span className="font-medium">Giờ:</span>
                  <span className="ml-2">{bookingInfo.time}</span>
                </div>
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <User className="w-4 h-4 mr-2 text-slate-500" />
                  <span className="font-medium">Thú cưng:</span>
                  <span className="ml-2">{bookingInfo.petName}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <span className="material-symbols-outlined w-4 h-4 mr-2 text-slate-500">store</span>
                  <span className="font-medium">Cơ sở:</span>
                  <span className="ml-2">{bookingInfo.shopName}</span>
                </div>
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <span className="material-symbols-outlined w-4 h-4 mr-2 text-slate-500">content_cut</span>
                  <span className="font-medium">Dịch vụ:</span>
                  <span className="ml-2">{bookingInfo.serviceName}</span>
                </div>
              </div>
            </div>

            {bookingInfo.petNote && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                <span className="font-medium text-slate-700 dark:text-slate-300">Ghi chú:</span>
                <p className="mt-1 text-slate-600 dark:text-slate-400">{bookingInfo.petNote}</p>
              </div>
            )}
          </div>

          {/* Booking ID */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 dark:text-blue-200 font-medium">Mã đặt lịch:</span>
              <span className="text-blue-800 dark:text-blue-200 font-bold">#{booking.id}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            to="/profile/bookings"
            className="flex-1 px-6 py-3 bg-[#1a2b4c] text-white font-semibold rounded-xl hover:bg-[#243d6b] transition-colors text-center"
          >
            Xem lịch đặt
          </Link>
          <Link
            to="/home"
            className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}