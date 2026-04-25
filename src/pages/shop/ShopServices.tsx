import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, X, Save, Camera, Info } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string;
  price: string;
  duration: string;
  description: string;
  isActive: boolean;
  image: string;
  details?: string;
}

const MOCK_SERVICES: Service[] = [
  {
    id: 'SV001',
    name: 'Grooming - Gói Basic',
    category: 'Chăm sóc',
    price: '250.000đ',
    duration: '60 phút',
    description: 'Tắm, sấy, cắt móng, vệ sinh tai',
    image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400',
    details: 'Gói dịch vụ cơ bản bao gồm: Tắm với sữa tắm chuyên dụng, sấy khô, cắt móng, vệ sinh tai. Phù hợp cho thú cưng cần chăm sóc định kỳ.',
    isActive: true,
  },
  {
    id: 'SV002',
    name: 'Grooming - Gói Premium',
    category: 'Chăm sóc',
    price: '450.000đ',
    duration: '90 phút',
    description: 'Tắm, sấy, cắt tỉa lông, cắt móng, vệ sinh tai, massage',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
    details: 'Gói dịch vụ cao cấp bao gồm: Tắm với sữa tắm cao cấp, sấy tạo kiểu, cắt tỉa lông theo yêu cầu, cắt móng, vệ sinh tai, massage thư giãn.',
    isActive: true,
  },
  {
    id: 'SV003',
    name: 'Khám tổng quát',
    category: 'Khám bệnh',
    price: '200.000đ',
    duration: '30 phút',
    description: 'Khám sức khỏe tổng quát, tư vấn dinh dưỡng',
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400',
    details: 'Dịch vụ khám sức khỏe tổng quát bao gồm: Kiểm tra thể trạng, cân nặng, nhiệt độ, tim mạch, hô hấp, tư vấn dinh dưỡng.',
    isActive: true,
  },
  {
    id: 'SV004',
    name: 'Tiêm phòng',
    category: 'Khám bệnh',
    price: '150.000đ',
    duration: '15 phút',
    description: 'Tiêm phòng dại, bệnh carré, parvo',
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400',
    details: 'Dịch vụ tiêm phòng các bệnh nguy hiểm: Dại, Carré, Parvo, Hepatitis. Vaccine chính hãng, có tem chống giả.',
    isActive: true,
  },
  {
    id: 'SV005',
    name: 'Lưu trú - Phòng Standard',
    category: 'Lưu trú',
    price: '300.000đ/đêm',
    duration: '24 giờ',
    description: 'Phòng điều hòa, 2 bữa ăn/ngày, chăm sóc cơ bản',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
    details: 'Phòng lưu trú tiêu chuẩn với điều hòa, sạch sẽ, thoáng mát. Bao gồm 2 bữa ăn/ngày, chăm sóc cơ bản.',
    isActive: true,
  },
  {
    id: 'SV006',
    name: 'Lưu trú - Phòng VIP',
    category: 'Lưu trú',
    price: '750.000đ/đêm',
    duration: '24 giờ',
    description: 'Phòng riêng, camera 24/7, 3 bữa ăn/ngày, chăm sóc đặc biệt',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    details: 'Phòng VIP cao cấp với không gian riêng tư, camera 24/7. Bao gồm 3 bữa ăn/ngày theo thực đơn riêng.',
    isActive: true,
  },
];

type ModalMode = 'add' | 'edit' | 'view' | null;

export default function ShopServices() {
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    category: 'Chăm sóc',
    price: '',
    duration: '',
    description: '',
    details: '',
    image: '',
    isActive: true,
  });

  const toggleServiceStatus = (id: string) => {
    setServices(services.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const categories = ['Tất cả', 'Chăm sóc', 'Khám bệnh', 'Lưu trú'];
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const filteredServices = selectedCategory === 'Tất cả'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const openAddModal = () => {
    setFormData({
      name: '',
      category: 'Chăm sóc',
      price: '',
      duration: '',
      description: '',
      details: '',
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400',
      isActive: true,
    });
    setModalMode('add');
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setFormData(service);
    setModalMode('edit');
  };

  const openViewModal = (service: Service) => {
    setSelectedService(service);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedService(null);
    setFormData({
      name: '',
      category: 'Chăm sóc',
      price: '',
      duration: '',
      description: '',
      details: '',
      image: '',
      isActive: true,
    });
  };

  const handleSave = () => {
    if (modalMode === 'add') {
      const newService: Service = {
        id: `SV${String(services.length + 1).padStart(3, '0')}`,
        name: formData.name || '',
        category: formData.category || 'Chăm sóc',
        price: formData.price || '',
        duration: formData.duration || '',
        description: formData.description || '',
        details: formData.details || '',
        image: formData.image || 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400',
        isActive: formData.isActive ?? true,
      };
      setServices([...services, newService]);
    } else if (modalMode === 'edit' && selectedService) {
      setServices(services.map(s => 
        s.id === selectedService.id 
          ? { ...s, ...formData } as Service
          : s
      ));
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Image */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute right-0 top-0 w-64 h-64 opacity-10 pointer-events-none hidden lg:block">
            
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quản lý dịch vụ</h1>
            <p className="text-slate-600 dark:text-slate-400">Thêm, sửa, xóa các dịch vụ của cửa hàng</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Thêm dịch vụ mới</span>
            <span className="sm:inline md:hidden">Thêm</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 overflow-hidden ${
                !service.isActive ? 'opacity-60' : ''
              }`}
            >
              {/* Service Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full shadow-sm">
                    {service.category}
                  </span>
                  {!service.isActive && (
                    <span className="px-3 py-1 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                      Tạm ngưng
                    </span>
                  )}
                </div>
                <button
                  onClick={() => openViewModal(service)}
                  className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm"
                >
                  <Info size={18} className="text-slate-700" />
                </button>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                  {service.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                  {service.description}
                </p>

                <div className="space-y-2 mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span>💰</span> Giá:
                    </span>
                    <span className="font-bold bg-gradient-to-r from-[#1a2b4c] to-slate-700 bg-clip-text text-transparent">{service.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span>⏱️</span> Thời gian:
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{service.duration}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleServiceStatus(service.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                      service.isActive
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    }`}
                  >
                    {service.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                    {service.isActive ? 'Ẩn' : 'Hiện'}
                  </button>
                  <button 
                    onClick={() => openEditModal(service)}
                    className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-5xl">📦</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">Chưa có dịch vụ nào trong danh mục này</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Thêm dịch vụ mới để bắt đầu</p>
          </div>
        )}

        {/* Modal - Add/Edit Service */}
        {(modalMode === 'add' || modalMode === 'edit') && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {modalMode === 'add' ? '➕ Thêm dịch vụ mới' : '✏️ Chỉnh sửa dịch vụ'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Hình ảnh dịch vụ
                  </label>
                  <div className="relative group">
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <img 
                        src={formData.image || 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400'} 
                        alt="Service preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold"
                    >
                      <Camera size={24} />
                      Thay đổi ảnh
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="URL hình ảnh"
                    className="w-full mt-3 px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Tên dịch vụ *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Grooming - Gói Premium"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Danh mục *
                    </label>
                    <select
                      value={formData.category || 'Chăm sóc'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                    >
                      <option>Chăm sóc</option>
                      <option>Khám bệnh</option>
                      <option>Lưu trú</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Giá *
                    </label>
                    <input
                      type="text"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="250.000đ"
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Thời gian *
                  </label>
                  <input
                    type="text"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="60 phút"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Mô tả ngắn *
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả ngắn gọn về dịch vụ..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    value={formData.details || ''}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Mô tả chi tiết về dịch vụ, quy trình, lưu ý..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Kích hoạt dịch vụ ngay sau khi lưu
                  </label>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                  <Save size={20} />
                  {modalMode === 'add' ? 'Thêm dịch vụ' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal - View Service Details */}
        {modalMode === 'view' && selectedService && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="relative">
                <img 
                  src={selectedService.image} 
                  alt={selectedService.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <button 
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white transition-all shadow-lg"
                >
                  <X size={24} className="text-slate-700" />
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full">
                      {selectedService.category}
                    </span>
                    <span className={`px-3 py-1 backdrop-blur-sm text-xs font-bold rounded-full ${
                      selectedService.isActive 
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-slate-500/90 text-white'
                    }`}>
                      {selectedService.isActive ? '✓ Đang hoạt động' : 'Tạm ngưng'}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedService.name}</h2>
                  <p className="text-slate-200">{selectedService.description}</p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1 flex items-center gap-1.5">
                      <span>💰</span> Giá dịch vụ
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{selectedService.price}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                      <span>⏱️</span> Thời gian
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{selectedService.duration}</p>
                  </div>
                </div>

                {selectedService.details && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span>📋</span> Chi tiết dịch vụ
                    </h3>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedService.details}
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Mã dịch vụ</p>
                  <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">#{selectedService.id}</p>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    openEditModal(selectedService);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                  <Edit size={20} />
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
