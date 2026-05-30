import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Camera, X, Clock, DollarSign, Tag, ToggleLeft, ToggleRight, Loader2, Package } from 'lucide-react';
import { serviceService } from '../../services/service.service';
import type { ServiceResponse, ServiceCreationRequest, ServiceUpdateRequest } from '../../types/api';

// ─── Camera tier options (defaults — shop can override label & price) ─────────

const CAMERA_TIERS = [
  { id: 'BASIC',     label: 'Cơ bản (720p)',     desc: 'Giám sát tiêu chuẩn, đã bao gồm trong gói', icon: '👁️',  defaultPrice: 0      },
  { id: 'HD',        label: 'Sắc nét (1080p HD)', desc: 'Hình ảnh sắc nét, màu sắc trung thực',       icon: '📺',  defaultPrice: 50000  },
  { id: 'PANORAMIC', label: 'Toàn cảnh (360°)',   desc: 'Xoay 360 độ, không góc chết',                icon: '🔄',  defaultPrice: 100000 },
  { id: 'AI',        label: 'AI Giám sát',         desc: 'Cảnh báo tự động hành vi bất thường',        icon: '🤖',  defaultPrice: 150000 },
];

// ─── Category helpers ────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  GROOMING: 'Chăm sóc',
  CLINIC: 'Khám bệnh',
  BOARDING: 'Lưu trú',
};

const ALL_CATEGORIES = ['Tất cả', 'GROOMING', 'CLINIC', 'BOARDING'];

function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

// ─── Form state type ──────────────────────────────────────────────────────────

interface ServiceForm {
  serviceName: string;
  price: number;
  durationMinutes: number;   // for BOARDING: stored as days in UI, converted to minutes on save
  durationDays: number;      // UI-only field for BOARDING
  description: string;
  imageUrl: string;
  category: string;
  active: boolean;
  // BOARDING-only
  cameraEnabled: boolean;
  cameraTiers: string[];
  cameraTierPrices: Record<string, number>;   // custom price per tier
  cameraTierLabels: Record<string, string>;   // custom label per tier
  cameraDescription: string;
  cageSize: string;
  roomType: string;
}

const EMPTY_FORM: ServiceForm = {
  serviceName: '',
  price: 0,
  durationMinutes: 1440,  // 1 day default for BOARDING
  durationDays: 1,
  description: '',
  imageUrl: '',
  category: 'GROOMING',
  active: true,
  cameraEnabled: false,
  cameraTiers: [],
  cameraTierPrices: {},
  cameraTierLabels: {},
  cameraDescription: '',
  cageSize: '',
  roomType: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShopServices() {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);

  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load services on mount ──────────────────────────────────────────────────

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceService.getMyShopServices();
      setServices(data);
    } catch {
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  // ── Toast helpers ───────────────────────────────────────────────────────────

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  }

  // ── Filtering ───────────────────────────────────────────────────────────────

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'Tất cả' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // ── Modal helpers ───────────────────────────────────────────────────────────

  function openAddModal() {
    setModalMode('add');
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImagePreview('');
    setShowModal(true);
  }

  function openEditModal(service: ServiceResponse) {
    setModalMode('edit');
    setEditingId(service.id);
    const durationDays = service.category === 'BOARDING'
      ? Math.round(service.durationMinutes / 1440) || 1
      : 1;
    setForm({
      serviceName: service.serviceName,
      price: service.price,
      durationMinutes: service.durationMinutes,
      durationDays,
      description: service.description ?? '',
      imageUrl: service.imageUrl ?? '',
      category: service.category,
      active: service.active,
      cameraEnabled: service.cameraEnabled ?? false,
      cameraTiers: service.cameraTiers ?? [],
      cameraTierPrices: service.cameraTierPrices ?? {},
      cameraTierLabels: service.cameraTierLabels ?? {},
      cameraDescription: service.cameraDescription ?? '',
      cageSize: service.cageSize?.join(', ') ?? '',
      roomType: service.roomType?.join(', ') ?? '',
    });
    setImagePreview(service.imageUrl ?? '');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setImagePreview('');
    setEditingId(null);
  }

  // ── Image upload ────────────────────────────────────────────────────────────

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    try {
      setUploadingImage(true);
      const uploadedUrl = await serviceService.uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      setImagePreview(uploadedUrl);
    } catch {
      showError('Tải ảnh lên thất bại. Vui lòng thử lại.');
      setImagePreview('');
      setForm((prev) => ({ ...prev, imageUrl: '' }));
    } finally {
      setUploadingImage(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // ── Save (create / update) ──────────────────────────────────────────────────

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving || uploadingImage) return;

    try {
      setSaving(true);

      // For BOARDING: convert days → minutes
      const durationMinutes = form.category === 'BOARDING'
        ? form.durationDays * 1440
        : form.durationMinutes;

      if (modalMode === 'add') {
        const payload: ServiceCreationRequest = {
          serviceName: form.serviceName,
          category: form.category,
          price: form.price,
          durationMinutes,
          description: form.description,
          imageUrl: form.imageUrl || undefined,
          ...(form.category === 'BOARDING' && {
            cameraEnabled: form.cameraEnabled,
            cameraTiers: form.cameraEnabled ? form.cameraTiers : [],
            cameraTierPrices: form.cameraEnabled ? form.cameraTierPrices : {},
            cameraTierLabels: form.cameraEnabled ? form.cameraTierLabels : {},
            cameraDescription: form.cameraEnabled ? form.cameraDescription : undefined,
            cageSize: form.cageSize ? form.cageSize.split(',').map(s=>s.trim()).filter(Boolean) : undefined,
            roomType: form.roomType ? form.roomType.split(',').map(s=>s.trim()).filter(Boolean) : undefined,
          }),
        };
        const created = await serviceService.createService(payload);
        setServices((prev) => [...prev, created]);
        showSuccess('Dịch vụ đã được thêm thành công!');
      } else {
        if (editingId === null) return;
        const payload: ServiceUpdateRequest = {
          serviceName: form.serviceName,
          category: form.category,
          price: form.price,
          durationMinutes,
          description: form.description,
          imageUrl: form.imageUrl || undefined,
          active: form.active,
          ...(form.category === 'BOARDING' && {
            cameraEnabled: form.cameraEnabled,
            cameraTiers: form.cameraEnabled ? form.cameraTiers : [],
            cameraTierPrices: form.cameraEnabled ? form.cameraTierPrices : {},
            cameraTierLabels: form.cameraEnabled ? form.cameraTierLabels : {},
            cameraDescription: form.cameraEnabled ? form.cameraDescription : undefined,
            cageSize: form.cageSize ? form.cageSize.split(',').map(s=>s.trim()).filter(Boolean) : undefined,
            roomType: form.roomType ? form.roomType.split(',').map(s=>s.trim()).filter(Boolean) : undefined,
          }),
        };
        const updated = await serviceService.updateService(editingId, payload);
        setServices((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
        showSuccess('Dịch vụ đã được cập nhật thành công!');
      }

      closeModal();
    } catch {
      showError('Lưu dịch vụ thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async function handleDelete(service: ServiceResponse) {
    if (!window.confirm(`Bạn có chắc muốn xóa dịch vụ "${service.serviceName}"?`)) return;

    try {
      await serviceService.deleteService(service.id);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      showSuccess('Dịch vụ đã được xóa.');
    } catch {
      showError('Xóa dịch vụ thất bại. Vui lòng thử lại.');
    }
  }

  // ── Toggle active status ────────────────────────────────────────────────────

  async function toggleServiceStatus(service: ServiceResponse) {
    try {
      const updated = await serviceService.updateService(service.id, { active: !service.active });
      setServices((prev) => prev.map((s) => (s.id === service.id ? updated : s)));
    } catch {
      showError('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              Quản lý dịch vụ
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Thêm, chỉnh sửa và quản lý các dịch vụ của cửa hàng</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-3 bg-[#1a2b4c] text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
          >
            <Plus size={20} />
            Thêm dịch vụ
          </button>
        </div>

        {/* Toast messages */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700 mb-6">
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 mb-6">
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
              />
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 flex-wrap">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    activeCategory === cat
                      ? 'bg-[#1a2b4c] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'Tất cả' ? 'Tất cả' : categoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[#1a2b4c]" />
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa có dịch vụ nào</h3>
            <p className="text-slate-500 mb-6">Thêm dịch vụ đầu tiên để bắt đầu nhận đặt lịch</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#1a2b4c] text-white rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              <Plus size={18} />
              Thêm dịch vụ
            </button>
          </div>
        )}

        {/* Service grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-slate-100">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.serviceName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera size={40} className="text-slate-300" />
                    </div>
                  )}
                  {/* Active badge */}
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold ${
                    service.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {service.active ? 'Đang hoạt động' : 'Tạm dừng'}
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-[#1a2b4c]/80 text-white rounded-full text-xs font-bold">
                    {categoryLabel(service.category)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1 truncate">{service.serviceName}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{service.description}</p>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <DollarSign size={15} className="text-[#1a2b4c]" />
                      <span className="font-semibold">{service.price.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock size={15} className="text-[#1a2b4c]" />
                      <span>{service.durationMinutes} phút</span>
                    </div>
                    {service.category === 'BOARDING' && service.cameraEnabled && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                        📷 {service.cameraTiers?.length ?? 0} loại camera
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    {/* Toggle status */}
                    <button
                      onClick={() => toggleServiceStatus(service)}
                      className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#1a2b4c] transition-colors"
                      title={service.active ? 'Tạm dừng dịch vụ' : 'Kích hoạt dịch vụ'}
                    >
                      {service.active
                        ? <ToggleRight size={22} className="text-green-500" />
                        : <ToggleLeft size={22} className="text-slate-400" />
                      }
                      {service.active ? 'Đang bật' : 'Đang tắt'}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-[#1a2b4c] hover:text-white transition-all"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(service)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-red-500 hover:text-white transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold">
                {modalMode === 'add' ? 'Thêm dịch vụ mới' : 'Chỉnh sửa dịch vụ'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSave} className="p-6 space-y-5">

              {/* Image upload */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hình ảnh dịch vụ</label>
                <div className="relative w-full h-40 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={36} className="text-slate-300" />
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 size={28} className="animate-spin text-white" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-3 right-3 size-9 bg-[#1a2b4c] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    disabled={uploadingImage}
                  >
                    <Camera size={16} />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Service name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tên dịch vụ *</label>
                <input
                  type="text"
                  value={form.serviceName}
                  onChange={(e) => setForm((prev) => ({ ...prev, serviceName: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  placeholder="Ví dụ: Tắm & sấy lông"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Danh mục *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  required
                >
                  <option value="GROOMING">Chăm sóc (Grooming)</option>
                  <option value="CLINIC">Khám bệnh (Clinic)</option>
                  <option value="BOARDING">Lưu trú (Boarding)</option>
                </select>
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Giá (đ) * <span className="font-normal text-slate-400">{form.category === 'BOARDING' ? '/ngày' : '/lần'}</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={form.price === 0 ? '' : form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                    placeholder="150000"
                    required
                  />
                </div>
                <div>
                  {form.category === 'BOARDING' ? (
                    <>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Số ngày tối thiểu *
                        <span className="ml-1 text-xs font-normal text-slate-400">(tự lưu thành phút)</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={form.durationDays === 0 ? '' : form.durationDays}
                        onChange={(e) => setForm((prev) => ({ ...prev, durationDays: Number(e.target.value) }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                        placeholder="1"
                        required
                      />
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Thời gian (phút) *</label>
                      <input
                        type="number"
                        min={5}
                        step={5}
                        value={form.durationMinutes === 0 ? '' : form.durationMinutes}
                        onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                        placeholder="60"
                        required
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none resize-none"
                  placeholder="Mô tả chi tiết về dịch vụ..."
                />
              </div>

              {/* ── BOARDING: Room config ─────────────────────────────────── */}
              {form.category === 'BOARDING' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Kích thước chuồng <span className="font-normal text-xs text-slate-400">(ngăn cách bởi dấu phẩy nếu có nhiều lựa chọn)</span>
                    </label>
                    <input
                      type="text"
                      value={form.cageSize}
                      onChange={(e) => setForm((prev) => ({ ...prev, cageSize: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                      placeholder="VD: Nhỏ, Vừa, Lớn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Loại phòng <span className="font-normal text-xs text-slate-400">(ngăn cách bởi dấu phẩy nếu có nhiều lựa chọn)</span>
                    </label>
                    <input
                      type="text"
                      value={form.roomType}
                      onChange={(e) => setForm((prev) => ({ ...prev, roomType: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                      placeholder="VD: Tiêu chuẩn, VIP"
                    />
                  </div>
                </div>
              )}

              {/* ── BOARDING: Camera config ─────────────────────────────────── */}
              {form.category === 'BOARDING' && (
                <div className="border border-indigo-200 rounded-2xl overflow-hidden">
                  {/* Header toggle */}
                  <div className="flex items-center justify-between px-5 py-4 bg-indigo-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <span className="text-xl">📷</span>
                      </div>
                      <div>
                        <p className="font-bold text-indigo-900 text-sm">Camera giám sát</p>
                        <p className="text-xs text-indigo-500">Chọn các loại camera shop hỗ trợ — User sẽ chọn 1 khi đặt lịch</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({
                        ...prev,
                        cameraEnabled: !prev.cameraEnabled,
                        cameraTiers: !prev.cameraEnabled ? [] : prev.cameraTiers,
                      }))}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                        form.cameraEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                        form.cameraEnabled ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  {/* Camera tier multi-select — only when enabled */}
                  {form.cameraEnabled && (
                    <div className="p-5 space-y-4 bg-white">
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                        Chọn loại camera shop hỗ trợ <span className="text-indigo-400 font-normal">(có thể chọn nhiều)</span>
                      </p>

                      <div className="flex flex-col gap-3">
                        {CAMERA_TIERS.map((tier) => {
                          const isChecked = form.cameraTiers.includes(tier.id);
                          const customLabel = form.cameraTierLabels[tier.id] ?? '';
                          const customPrice = form.cameraTierPrices[tier.id] ?? tier.defaultPrice;
                          return (
                            <div key={tier.id} className={`rounded-xl border-2 overflow-hidden transition-all ${
                              isChecked ? 'border-indigo-500' : 'border-slate-200'
                            }`}>
                              {/* Tier header — click to toggle */}
                              <button
                                type="button"
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    cameraTiers: isChecked
                                      ? prev.cameraTiers.filter(t => t !== tier.id)
                                      : [...prev.cameraTiers, tier.id],
                                  }));
                                }}
                                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                                  isChecked ? 'bg-indigo-50' : 'bg-white hover:bg-slate-50'
                                }`}
                              >
                                {/* Checkbox */}
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                  isChecked ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'
                                }`}>
                                  {isChecked && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                {/* Icon */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                                  isChecked ? 'bg-indigo-500 text-white' : 'bg-slate-100'
                                }`}>
                                  {tier.icon}
                                </div>
                                {/* Default info */}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-bold ${isChecked ? 'text-indigo-900' : 'text-slate-700'}`}>
                                    {tier.label}
                                  </p>
                                  <p className="text-[11px] text-slate-400">{tier.desc}</p>
                                </div>
                                {/* Default price hint */}
                                <span className="text-xs text-slate-400 shrink-0">
                                  mặc định: {tier.defaultPrice === 0 ? 'Miễn phí' : `+${tier.defaultPrice.toLocaleString('vi-VN')}đ`}
                                </span>
                              </button>

                              {/* Custom label & price inputs — only when tier is selected */}
                              {isChecked && (
                                <div className="px-4 pb-4 pt-2 bg-indigo-50/60 border-t border-indigo-100 grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-indigo-700 mb-1">
                                      Tên hiển thị <span className="font-normal text-slate-400">(tuỳ chọn)</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={customLabel}
                                      onChange={(e) => setForm((prev) => ({
                                        ...prev,
                                        cameraTierLabels: { ...prev.cameraTierLabels, [tier.id]: e.target.value },
                                      }))}
                                      placeholder={tier.label}
                                      className="w-full px-3 py-1.5 text-sm border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-indigo-700 mb-1">
                                      Giá thêm (đ/ngày)
                                    </label>
                                    <input
                                      type="number"
                                      min={0}
                                      step={1000}
                                      value={customPrice}
                                      onChange={(e) => setForm((prev) => ({
                                        ...prev,
                                        cameraTierPrices: { ...prev.cameraTierPrices, [tier.id]: Number(e.target.value) },
                                      }))}
                                      className="w-full px-3 py-1.5 text-sm border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Validation hint */}
                      {form.cameraTiers.length === 0 && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <span>⚠️</span> Vui lòng chọn ít nhất 1 loại camera
                        </p>
                      )}

                      {/* Camera description */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Mô tả camera <span className="font-normal text-slate-400">(hiển thị riêng trong phần camera, không phải mô tả chung)</span>
                        </label>
                        <textarea
                          value={form.cameraDescription}
                          onChange={(e) => setForm((prev) => ({ ...prev, cameraDescription: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none text-sm resize-none"
                          placeholder="Ví dụ: Camera góc rộng, xem được toàn bộ phòng, lưu trữ 24h..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Active toggle (edit mode only) */}
              {modalMode === 'edit' && (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-700">Trạng thái dịch vụ</p>
                    <p className="text-sm text-slate-500">
                      {form.active ? 'Dịch vụ đang hoạt động' : 'Dịch vụ đang tạm dừng'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
                    className="transition-colors"
                  >
                    {form.active
                      ? <ToggleRight size={36} className="text-green-500" />
                      : <ToggleLeft size={36} className="text-slate-400" />
                    }
                  </button>
                </div>
              )}

              {/* Footer buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1a2b4c] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {modalMode === 'add' ? 'Thêm dịch vụ' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
