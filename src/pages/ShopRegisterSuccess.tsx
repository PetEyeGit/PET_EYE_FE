import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail, Clock, FileText, Home } from 'lucide-react';

export default function ShopRegisterSuccess() {
  return (
    <div className="flex-1 bg-slate-50 min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-24 rounded-full bg-green-100 mb-6 animate-bounce">
            <CheckCircle className="text-green-500" size={48} />
          </div>
          <h1 className="text-4xl font-black mb-2">Đăng ký thành công!</h1>
          <p className="text-slate-600 text-lg">
            Cảm ơn bạn đã đăng ký trở thành đối tác của Peteye
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Tài khoản đã được kích hoạt</h3>
                <p className="text-slate-600 text-sm">
                  Bạn có thể đăng nhập ngay bây giờ để bắt đầu sử dụng hệ thống. (Chế độ demo - không cần phê duyệt)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <Mail className="text-purple-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Kiểm tra email</h3>
                <p className="text-slate-600 text-sm">
                  Chúng tôi đã gửi email xác nhận đến địa chỉ bạn đăng ký. Vui lòng kiểm tra hộp thư (kể cả thư rác).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <FileText className="text-orange-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Chuẩn bị tài liệu</h3>
                <p className="text-slate-600 text-sm">
                  Trong thời gian chờ, vui lòng chuẩn bị các tài liệu sau:
                </p>
                <ul className="text-sm text-slate-600 mt-2 space-y-1 ml-4">
                  <li>• Ảnh giấy phép kinh doanh (rõ nét)</li>
                  <li>• Ảnh CMND/CCCD người đại diện</li>
                  <li>• Ảnh cơ sở kinh doanh (3-5 ảnh)</li>
                  <li>• Chứng chỉ hành nghề (nếu có)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-[#1a2b4c] to-slate-900 rounded-2xl p-8 text-white mb-6">
          <h3 className="font-bold text-xl mb-4">🎉 Bạn đã sẵn sàng!</h3>
          <p className="text-slate-200 mb-4">
            Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay để:
          </p>
          <ul className="space-y-2 text-sm text-slate-200">
            <li className="flex items-start gap-2">
              <span className="text-[#2dd4bf]">✓</span>
              <span>Quản lý thông tin cửa hàng và dịch vụ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2dd4bf]">✓</span>
              <span>Nhận và xử lý đơn đặt lịch từ khách hàng</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2dd4bf]">✓</span>
              <span>Theo dõi doanh thu và báo cáo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2dd4bf]">✓</span>
              <span>Tương tác với khách hàng qua tin nhắn</span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold mb-3">💬 Cần hỗ trợ?</h3>
          <p className="text-sm text-slate-700 mb-3">
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ:
          </p>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Mail size={16} className="text-blue-600" />
              <span className="font-medium">Email:</span>
              <a href="mailto:partner@Peteye.vn" className="text-blue-600 hover:underline">partner@Peteye.vn</a>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-blue-600">📞</span>
              <span className="font-medium">Hotline:</span>
              <a href="tel:1900xxxx" className="text-blue-600 hover:underline">1900-xxxx</a>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to="/shop/login"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Đến trang đăng nhập
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#1a2b4c] text-white rounded-xl font-bold hover:opacity-90 transition-all"
          >
            <Home size={20} />
            Về trang chủ
          </Link>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Cảm ơn bạn đã tin tưởng và lựa chọn Peteye! 🎉
        </p>
      </div>
    </div>
  );
}

