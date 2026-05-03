import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function PaymentFailure() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const errorMessage = searchParams.get('message') || location.state?.error || 'Thanh toán không thành công. Vui lòng thử lại.';
  const bookingInfo = location.state?.bookingInfo;

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        {/* Failure Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Thanh toán thất bại
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {errorMessage}
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">
                Nguyên nhân có thể:
              </h3>
              <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                <li>• Số dư tài khoản không đủ</li>
                <li>• Thông tin thẻ không hợp lệ</li>
                <li>• Mạng internet không ổn định</li>
                <li>• Hệ thống thanh toán gặp sự cố</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Booking Info if available */}
        {bookingInfo && (
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Thông tin đặt lịch
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Cơ sở:</span>
                <p className="text-slate-600 dark:text-slate-400">{bookingInfo.shopName}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Dịch vụ:</span>
                <p className="text-slate-600 dark:text-slate-400">{bookingInfo.serviceName}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Ngày:</span>
                <p className="text-slate-600 dark:text-slate-400">{bookingInfo.date}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Giờ:</span>
                <p className="text-slate-600 dark:text-slate-400">{bookingInfo.time}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/home"
            className="flex-1 px-6 py-3 bg-[#1a2b4c] text-white font-semibold rounded-xl hover:bg-[#243d6b] transition-colors text-center flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Link>
          <Link
            to="/profile/bookings"
            className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center"
          >
            Xem lịch đặt
          </Link>
        </div>

        {/* Support */}
        <div className="text-center mt-6 pt-6 border-t border-slate-200 dark:border-slate-600">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Cần hỗ trợ? Liên hệ với chúng tôi qua{' '}
            <a href="tel:1900-xxxx" className="text-[#1a2b4c] hover:underline">
              hotline 1900-xxxx
            </a>{' '}
            hoặc{' '}
            <a href="mailto:support@peteye.com" className="text-[#1a2b4c] hover:underline">
              email support@peteye.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}