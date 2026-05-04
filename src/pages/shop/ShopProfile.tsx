import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Mail, Clock, Camera, Save, Loader2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { shopService } from '../../services/shop.service';
import { fileService } from '../../services/file.service';
import toast from 'react-hot-toast';

export default function ShopProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  const [shopInfo, setShopInfo] = useState({
    name: '',
    type: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    description: '',
    openTime: '08:00',
    closeTime: '20:00',
    workingDays: [] as string[],
    logoUrl: '',
    bannerUrl: '',
    isVerified: false,
  });

  const VIETNAM_CITIES = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 
    'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Lâm Đồng', 'Quảng Ninh'
  ];

  useEffect(() => {
    fetchShopProfile();
  }, []);

  const fetchShopProfile = async () => {
    try {
      setLoading(true);
      const data = await shopService.getMyShop();
      console.log('API getMyShop returned:', data);
      setShopInfo(prev => ({
        ...prev,
        name: data.shopName || prev.name,
        type: data.shopType || prev.type,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        address: data.address || prev.address,
        city: data.city || prev.city,
        description: data.description || prev.description,
        openTime: data.openTime || prev.openTime,
        closeTime: data.closeTime || prev.closeTime,
        workingDays: data.workingDays ? data.workingDays.split(',') : prev.workingDays,
        logoUrl: data.logoUrl || prev.logoUrl,
        bannerUrl: data.bannerUrl || prev.bannerUrl,
        isVerified: data.isVerified,
      }));
    } catch (err) {
      console.error('Failed to fetch shop profile:', err);
      toast.error('Không thể tải thông tin cửa hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted. Current shopInfo:', shopInfo);
    try {
      setSaving(true);
      setError(null);
      const updateData = {
        shopName: shopInfo.name,
        shopType: shopInfo.type,
        email: shopInfo.email,
        phone: shopInfo.phone,
        address: shopInfo.address,
        city: shopInfo.city,
        description: shopInfo.description,
        openTime: shopInfo.openTime,
        closeTime: shopInfo.closeTime,
        workingDays: shopInfo.workingDays.join(','),
        logoUrl: shopInfo.logoUrl,
        bannerUrl: shopInfo.bannerUrl,
      };
      console.log('Sending update request with data:', updateData);
      const data = await shopService.updateMyShop(updateData);
      
      // Update state safely using prev state
      setShopInfo(prev => ({
        ...prev,
        name: data.shopName || prev.name,
        type: data.shopType || prev.type,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        address: data.address || prev.address,
        city: data.city || prev.city,
        description: data.description || prev.description,
        openTime: data.openTime || prev.openTime,
        closeTime: data.closeTime || prev.closeTime,
        workingDays: data.workingDays ? data.workingDays.split(',') : prev.workingDays,
        logoUrl: data.logoUrl || prev.logoUrl,
        bannerUrl: data.bannerUrl || prev.bannerUrl,
        isVerified: data.isVerified,
      }));
      
      toast.success('Đã cập nhật thông tin cửa hàng!');
    } catch (err) {
      console.error('Failed to update shop profile:', err);
      toast.error('Cập nhật thông tin thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    try {
      if (type === 'logo') setUploadingLogo(true);
      else setUploadingBanner(true);

      const url = await fileService.upload(file);
      setShopInfo(prev => ({
        ...prev,
        [type === 'logo' ? 'logoUrl' : 'bannerUrl']: url
      }));
      toast.success(`Đã tải ${type === 'logo' ? 'logo' : 'ảnh bìa'} lên thành công!`);
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Tải ảnh lên thất bại');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  const toggleWorkingDay = (day: string) => {
    setShopInfo({
      ...shopInfo,
      workingDays: shopInfo.workingDays.includes(day)
        ? shopInfo.workingDays.filter(d => d !== day)
        : [...shopInfo.workingDays, day],
    });
  };

  console.log('Rendering ShopProfile with logo:', shopInfo.logoUrl);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Thông tin cửa hàng</h1>
          <p className="text-slate-600">Quản lý thông tin và cài đặt cửa hàng của bạn</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 mb-6">
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
            <Loader2 size={40} className="animate-spin text-[#1a2b4c] mb-4" />
            <p className="text-slate-500 font-medium">Đang tải thông tin cửa hàng...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Shop Media */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                {shopInfo.isVerified && (
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100">
                    <ShieldCheck size={14} />
                    Đã xác minh
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Store size={20} className="text-primary" />
                Hình ảnh cửa hàng
              </h3>
              
              <div className="space-y-8">
                {/* Banner Section */}
                <div className="relative group">
                  <div className="w-full h-48 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                    {uploadingBanner ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <Loader2 className="animate-spin text-primary" size={32} />
                      </div>
                    ) : shopInfo.bannerUrl ? (
                      <img src={shopInfo.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon size={40} className="mb-2" />
                        <p className="text-xs font-medium">Chưa có ảnh bìa</p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={bannerInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'banner')}
                  />
                  <button 
                    type="button" 
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-slate-700 hover:bg-white transition-all flex items-center gap-2 text-xs font-bold border border-slate-200 disabled:opacity-50"
                  >
                    <Camera size={14} />
                    {uploadingBanner ? 'Đang tải...' : 'Thay ảnh bìa'}
                  </button>
                </div>

                {/* Logo & Info */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="relative">
                    <div className="size-32 rounded-3xl bg-white p-1 shadow-xl border border-slate-100 -mt-16 md:-mt-20 ml-4 relative z-10 overflow-hidden">
                      <div className="w-full h-full rounded-[1.25rem] bg-slate-50 overflow-hidden flex items-center justify-center">
                        {uploadingLogo ? (
                          <Loader2 className="animate-spin text-primary" size={24} />
                        ) : shopInfo.logoUrl ? (
                          <img src={shopInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Store size={40} className="text-slate-200" />
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={logoInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                      />
                      <button 
                        type="button" 
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="absolute bottom-2 right-2 p-1.5 bg-primary text-white rounded-lg shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                      >
                        <Camera size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      {shopInfo.name || 'Tên cửa hàng'}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      {shopInfo.type || 'Chưa cập nhật loại hình'} • {shopInfo.city || 'Chưa cập nhật địa chỉ'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tên cửa hàng *
                </label>
                <input
                  type="text"
                  value={shopInfo.name}
                  onChange={(e) => setShopInfo({ ...shopInfo, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Loại hình *
                </label>
                <select
                  value={shopInfo.type}
                  onChange={(e) => setShopInfo({ ...shopInfo, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                >
                  <option>Phòng khám thú y</option>
                  <option>Spa & Grooming</option>
                  <option>Khách sạn thú cưng</option>
                  <option>Cửa hàng thú cưng</option>
                  <option>Dịch vụ tổng hợp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={shopInfo.email}
                  onChange={(e) => setShopInfo({ ...shopInfo, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={shopInfo.phone}
                  onChange={(e) => setShopInfo({ ...shopInfo, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  placeholder="Ví dụ: 0912345678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Thành phố/Tỉnh *
                </label>
                <select
                  value={shopInfo.city}
                  onChange={(e) => setShopInfo({ ...shopInfo, city: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  required
                >
                  <option value="">Chọn thành phố</option>
                  {VIETNAM_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  value={shopInfo.address}
                  onChange={(e) => setShopInfo({ ...shopInfo, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={shopInfo.description}
                  onChange={(e) => setShopInfo({ ...shopInfo, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Giờ làm việc</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Giờ mở cửa
                  </label>
                  <input
                    type="time"
                    value={shopInfo.openTime}
                    onChange={(e) => setShopInfo({ ...shopInfo, openTime: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Giờ đóng cửa
                  </label>
                  <input
                    type="time"
                    value={shopInfo.closeTime}
                    onChange={(e) => setShopInfo({ ...shopInfo, closeTime: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Ngày làm việc
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWorkingDay(day)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        shopInfo.workingDays.includes(day)
                          ? 'bg-[#1a2b4c] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#1a2b4c] text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-70"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
