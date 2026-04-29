import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Camera, X, Clock, DollarSign, Tag, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { serviceService } from '../../services/service.service';
import type { ServiceResponse, ServiceCreationRequest, ServiceUpdateRequest } from '../../types/api';

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
  durationMinutes: number;
  description: string;
  imageUrl: string;
  category: string;
  active: boolean;
}

const EMPTY_FORM: ServiceForm = {
  serviceName: '',
  price: 0,
  durationMinutes: 30,
  description: '',
  imageUrl: '',
  category: 'GROOMING',
  active: true,
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
    setForm({
      serviceName: service.serviceName,
      price: service.price,
      durationMinutes: service.durationMinutes,
      description: service.description ?? '',
      imageUrl: service.imageUrl ?? '',
      category: service.category,
      active: service.active,
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

      if (modalMode === 'add') {
        const payload: ServiceCreationRequest = {
          serviceName: form.serviceName,
          category: form.category,
          price: form.price,
          durationMinutes: form.durationMinutes,
          description: form.description,
          imageUrl: form.imageUrl || undefined,
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
          durationMinutes: form.durationMinutes,
          description: form.description,
          imageUrl: form.imageUrl || undefined,
          active: form.active,
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý dịch vụ</h1>
            <p className="text-slate-600">Thêm, chỉnh sửa và quản lý các dịch vụ của cửa hàng</p>
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Giá (đ) *</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                    placeholder="150000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Thời gian (phút) *</label>
                  <input
                    type="number"
                    min={1}
                    step={5}
                    value={form.durationMinutes}
                    onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                    placeholder="60"
                    required
                  />
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
