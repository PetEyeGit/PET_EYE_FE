import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Mail, Clock, Camera, Save, Loader2 } from 'lucide-react';
import { shopService } from '../../services/shop.service';

export default function ShopProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    imageUrl: '',
  });

  useEffect(() => {
    fetchShopProfile();
  }, []);

  const fetchShopProfile = async () => {
    try {
      setLoading(true);
      const data = await shopService.getMyShop();
      setShopInfo({
        name: data.shopName,
        type: data.shopType,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        description: data.description || '',
        openTime: data.openTime || '08:00',
        closeTime: data.closeTime || '20:00',
        workingDays: data.workingDays ? data.workingDays.split(',') : [],
        imageUrl: data.licenseImageUrl || '', // Fallback or use a dedicated logo field if available
      });
    } catch (err) {
      console.error('Failed to fetch shop profile:', err);
      setError('Không thể tải thông tin cửa hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await shopService.updateMyShop({
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
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update shop profile:', err);
      setError('Cập nhật thông tin thất bại.');
    } finally {
      setSaving(false);
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
            {/* Shop Image */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Hình ảnh cửa hàng</h3>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative">
                  <div className="size-32 rounded-xl bg-slate-100 overflow-hidden">
                    {shopInfo.imageUrl ? (
                      <img
                        src={shopInfo.imageUrl}
                        alt="Shop"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store size={40} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                <button
                  type="button"
                  className="absolute bottom-2 right-2 size-8 bg-[#1a2b4c] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Camera size={16} />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-3">
                  Tải lên ảnh đại diện cho cửa hàng của bạn. Ảnh nên có kích thước tối thiểu 400x400px.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#1a2b4c] text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                >
                  Tải ảnh mới
                </button>
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
                  required
                />
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
