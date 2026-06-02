import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Legal() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(
    location.pathname.includes('privacy') ? 'privacy' : 'terms'
  );

  useEffect(() => {
    if (location.pathname.includes('privacy')) setActiveTab('privacy');
    else setActiveTab('terms');
  }, [location.pathname]);

  const termsContent = (
    <div className="space-y-8 text-slate-600 leading-relaxed">
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">1. Giới thiệu chung</h3>
        <p>Chào mừng bạn đến với PetEye. Khi sử dụng nền tảng của chúng tôi (bao gồm ứng dụng và website), bạn (người dùng/chủ cơ sở) đồng ý với các điều khoản dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.</p>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">2. Dành cho Người dùng (Khách hàng)</h3>
        <ul className="list-disc pl-6 space-y-3">
          <li>Bạn cam kết cung cấp thông tin chính xác khi đặt lịch hẹn hoặc sử dụng dịch vụ trên nền tảng.</li>
          <li>PetEye không chịu trách nhiệm trực tiếp về chất lượng dịch vụ của từng cơ sở thú y, tuy nhiên chúng tôi sẽ hỗ trợ giải quyết khiếu nại dựa trên bằng chứng minh bạch (ví dụ: qua camera).</li>
          <li>Việc hủy lịch cần tuân thủ quy định thời gian của từng cơ sở để tránh phí phạt.</li>
          <li>
            <strong>Quy định về việc đi trễ:</strong> Nếu khách hàng đến trễ quá 15 phút so với giờ hẹn, lịch đặt sẽ tự động bị hủy bởi nhân viên cơ sở. Trong trường hợp này:
            <ul className="list-[circle] pl-6 mt-2 space-y-1 text-sm">
              <li><strong>Đối với đơn thanh toán trả trước (100%):</strong> Khách hàng sẽ bị trừ phí hoa hồng của nền tảng và 50% phí đền bù cho Shop dựa trên giá trị đơn hàng, số tiền còn lại sẽ được hoàn trả.</li>
              <li><strong>Đối với đơn thanh toán tại quầy:</strong> Khách hàng sẽ bị trừ/thu phí hoa hồng của nền tảng. Về phần tiền đền bù thiệt hại cho lịch hẹn trống, khách hàng sẽ tự thỏa thuận và thanh toán trực tiếp với Shop.</li>
            </ul>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">3. Dành cho Đối tác (Cơ sở thú y/Shop)</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Cơ sở phải đảm bảo có đầy đủ giấy phép kinh doanh, chứng chỉ hành nghề hợp lệ.</li>
          <li>Cam kết cung cấp dịch vụ đúng như mô tả trên PetEye. Mọi hành vi gian lận hoặc ngược đãi động vật sẽ dẫn đến việc khóa tài khoản vĩnh viễn.</li>
          <li>Đồng ý cho phép PetEye tích hợp và stream Live Camera (nếu có đăng ký dịch vụ camera) cho khách hàng trong thời gian họ sử dụng dịch vụ lưu trú/spa.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">4. Quyền sở hữu trí tuệ</h3>
        <p>Mọi nội dung, hình ảnh, mã nguồn và dữ liệu trên nền tảng thuộc bản quyền của PetEye. Nghiêm cấm sao chép, phân phối dưới mọi hình thức khi chưa có sự cho phép.</p>
      </section>
    </div>
  );

  const privacyContent = (
    <div className="space-y-8 text-slate-600 leading-relaxed">
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">1. Thu thập thông tin</h3>
        <p>Chúng tôi thu thập các thông tin bao gồm: Họ tên, số điện thoại, email, thông tin thú cưng và vị trí (nếu được cho phép) nhằm mục đích tối ưu hóa trải nghiệm tìm kiếm cơ sở thú y.</p>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">2. Bảo mật Dữ liệu Camera (Live Feed)</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Luồng video trực tiếp từ các cơ sở đối tác được mã hóa đầu cuối.</li>
          <li>Chỉ những khách hàng đã xác thực và có thú cưng đang lưu trú tại đúng khu vực camera mới được cấp quyền truy cập tạm thời.</li>
          <li>Chúng tôi KHÔNG lưu trữ vĩnh viễn các đoạn phim trừ khi có yêu cầu trích xuất phục vụ giải quyết khiếu nại.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">3. Chia sẻ thông tin</h3>
        <p>PetEye cam kết không bán, trao đổi hoặc chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ 3 nào vì mục đích thương mại. Thông tin chỉ được chia sẻ cho cơ sở thú y nơi bạn đặt lịch nhằm phục vụ việc chăm sóc thú cưng.</p>
      </section>
      
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">4. Quyền của người dùng</h3>
        <p>Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân của mình khỏi hệ thống PetEye bất kỳ lúc nào thông qua phần Cài đặt tài khoản.</p>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Chính sách & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Quy định</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium">Minh bạch, rõ ràng và đặt quyền lợi của người dùng cùng thú cưng lên hàng đầu.</p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-slate-100">
          
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 border-b border-slate-100 pb-6">
            <Link 
              to="/terms"
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all ${activeTab === 'terms' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            >
              <FileText size={20} />
              Điều khoản sử dụng
            </Link>
            <Link 
              to="/privacy"
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all ${activeTab === 'privacy' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            >
              <Shield size={20} />
              Chính sách bảo mật
            </Link>
          </div>

          {/* Content Body */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'terms' ? termsContent : privacyContent}
          </motion.div>

          {/* Contact Support */}
          <div className="mt-16 pt-8 border-t border-slate-100">
            <div className="bg-blue-50 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Bạn có thắc mắc?</h4>
                <p className="text-slate-600">Đội ngũ CSKH của chúng tôi luôn sẵn sàng giải đáp 24/7.</p>
              </div>
              <a href="mailto:hotro@peteye.vn" className="px-6 py-3 bg-white text-primary font-bold rounded-full shadow-sm hover:shadow-md transition-shadow">
                Liên hệ hỗ trợ
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
