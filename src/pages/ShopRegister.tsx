import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Mail, Phone, Lock, MapPin, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ShopRegister() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    shopName: '',
    shopType: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    description: '',
    password: '',
    confirmPassword: '',
    businessLicense: '',
    agreed: false
  });

  const shopTypes = [
    'Phòng khám thú y',
    'Spa & Grooming',
    'Khách sạn thú cưng',
    'Cửa hàng thú cưng',
    'Dịch vụ tổng hợp'
  ];

  const cities = [
    'TP. Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    'Khác'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }

    if (!formData.agreed) {
      alert('Vui lòng đồng ý với điều khoản dịch vụ');
      return;
    }

    // FAKE DATA - Auto approve for testing
    localStorage.setItem(`shop_data_${formData.email}`, JSON.stringify(formData));
    
    // Navigate to success page
    navigate('/shop/register/success');
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.shopName && formData.shopType && formData.email && formData.phone;
    }
    if (step === 2) {
      return formData.address && formData.city && formData.description;
    }
    if (step === 3) {
      return formData.password && formData.confirmPassword && formData.businessLicense && formData.agreed;
    }
    return false;
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="size-16 bg-[#1a2b4c] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black mb-2">Đăng ký làm đối tác</h1>
          <p className="text-slate-600">Tham gia Peteye để tiếp cận hàng ngàn khách hàng</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Thông tin cơ bản' },
              { num: 2, label: 'Địa chỉ & Mô tả' },
              { num: 3, label: 'Xác thực' }
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`size-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    step >= s.num
                      ? 'bg-[#1a2b4c] text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {step > s.num ? <CheckCircle size={24} /> : s.num}
                  </div>
                  <span className={`text-xs mt-2 font-medium text-center ${
                    step >= s.num ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                    step > s.num ? 'bg-[#1a2b4c]' : 'bg-slate-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tên cửa hàng/Phòng khám *
                </label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  placeholder="Ví dụ: PetCare Sài Gòn"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1a2b4c] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Loại hình kinh doanh *
                </label>
                <select
                  value={formData.shopType}
                  onChange={(e) => setFormData({ ...formData, shopType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1a2b4c] outline-none"
                  required
                >
                  <option value="">Chọn loại hình</option>
                  {shopTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="shop@example.com"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1a2b4c] outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Số điện thoại *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0901234567"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1a2b4c] outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address & Description */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Địa chỉ *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-400" size={20} />
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1a2b4c] outline-none resize-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Thành phố *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1a2b4c] outline-none"
                  required
                >
                  <option value="">Chọn thành phố</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Mô tả về cửa hàng *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Giới thiệu về cửa hàng, dịch vụ, đội ngũ..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1a2b4c] outline-none resize-none"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">Tối thiểu 100 ký tự</p>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1a2b4c] outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Xác nhận mật khẩu *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1a2b4c] outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Giấy phép kinh doanh *
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={formData.businessLicense}
                    onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
                    placeholder="Số giấy phép kinh doanh"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1a2b4c] outline-none"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Bạn sẽ cần upload ảnh giấy phép sau khi tài khoản được tạo
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="text-blue-500" size={18} />
                  Quy trình phê duyệt
                </h4>
                <ul className="text-xs text-slate-700 space-y-1 ml-6">
                  <li>1. Gửi đơn đăng ký</li>
                  <li>2. Admin xem xét hồ sơ (1-2 ngày làm việc)</li>
                  <li>3. Nhận email thông báo kết quả</li>
                  <li>4. Đăng nhập và bắt đầu sử dụng</li>
                </ul>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreed}
                  onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                  className="mt-1 rounded border-slate-300 text-[#1a2b4c] focus:ring-[#1a2b4c]"
                />
                <label htmlFor="terms" className="text-xs text-slate-600">
                  Tôi đồng ý với <a href="#" className="font-bold text-[#1a2b4c] hover:underline">Điều khoản dịch vụ</a> và{' '}
                  <a href="#" className="font-bold text-[#1a2b4c] hover:underline">Chính sách bảo mật</a> của Peteye.
                  Tôi cam kết cung cấp thông tin chính xác và tuân thủ các quy định của nền tảng.
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Quay lại
              </button>
            )}
            <button
              type="submit"
              disabled={!isStepValid()}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${
                isStepValid()
                  ? 'bg-[#1a2b4c] hover:bg-[#1a2b4c]/90'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {step === 3 ? 'Gửi đơn đăng ký' : 'Tiếp tục'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            Đã có tài khoản? <Link to="/shop/login" className="text-[#1a2b4c] font-bold hover:underline">Đăng nhập tại đây</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

