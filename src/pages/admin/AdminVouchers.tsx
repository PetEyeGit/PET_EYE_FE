import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Ticket } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../services/admin.service';

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);

  const [formData, setFormData] = useState({
    code: '',
    targetTierName: 'Vàng',
    requiredSpending: 1000000,
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 0,
    issueQuantity: 1,
    validDays: 30
  });

  const loadVouchers = async () => {
    try {
      const data = await adminService.getAllVouchers();
      setVouchers(data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách voucher');
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa cấu hình này?')) {
      try {
        await adminService.deleteVoucher(id);
        toast.success('Đã xóa');
        loadVouchers();
      } catch (error) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }

    try {
      if (editingVoucher) {
        await adminService.updateVoucher(editingVoucher.id, formData);
        toast.success('Đã cập nhật cấu hình');
      } else {
        await adminService.createVoucher(formData);
        toast.success('Đã tạo cấu hình mới');
      }
      setIsModalOpen(false);
      setEditingVoucher(null);
      loadVouchers();
    } catch (error) {
      toast.error(editingVoucher ? 'Cập nhật thất bại' : 'Tạo thất bại');
    }
  };

  const openEditModal = (voucher: any = null) => {
    setEditingVoucher(voucher);
    if (voucher) {
      setFormData({
        code: voucher.code,
        targetTierName: voucher.targetTier?.name || 'Vàng',
        requiredSpending: voucher.targetTier?.requiredSpending || 1000000,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        minOrderValue: voucher.minOrderValue || 0,
        issueQuantity: voucher.issueQuantity || 1,
        validDays: voucher.validDays || 30
      });
    } else {
      setFormData({
        code: '',
        targetTierName: 'Vàng',
        requiredSpending: 1000000,
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 0,
        issueQuantity: 1,
        validDays: 30
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Ticket className="w-8 h-8 text-blue-600" />
            Cấu Hình Voucher & Hạng
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Quản lý mức chi tiêu cần đạt để lên hạng và phần thưởng voucher tương ứng.
          </p>
        </div>
        <button
          onClick={() => openEditModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          Tạo Cấu Hình Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã voucher..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-5 py-3 rounded-2xl bg-slate-50 text-slate-600 font-semibold flex items-center gap-2 hover:bg-slate-100 transition">
          <Filter className="w-4 h-4" />
          Lọc
        </button>
      </div>

      {/* Voucher Table */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200/60">
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-slate-500 font-black">Hạng & Mốc Đạt</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-slate-500 font-black">Mã Voucher</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-slate-500 font-black">Giảm Giá</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-slate-500 font-black">Số Lượng</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-slate-500 font-black text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vouchers.filter(v => v.code.toLowerCase().includes(searchTerm.toLowerCase())).map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        v.targetTier?.name === 'Vàng' ? 'bg-amber-100 text-amber-700' : 
                        v.targetTier?.name === 'Kim Cương' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        Hạng {v.targetTier?.name}
                      </span>
                      <span className="text-sm font-bold text-slate-600 mt-1">
                        Cần {v.targetTier?.requiredSpending?.toLocaleString() || 0}đ
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg text-sm">{v.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-emerald-600">
                      {v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`}
                    </span>
                    {v.minOrderValue > 0 && <span className="block text-[11px] text-slate-400 mt-1">Đơn tối thiểu: {v.minOrderValue.toLocaleString()}đ</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">{v.issueQuantity} bản sao</span>
                    <span className="block text-[11px] text-slate-400 mt-1">Hạn {v.validDays} ngày</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(v)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Chưa có cấu hình nào. Hãy tạo mới.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cấu Hình */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">
                {editingVoucher ? 'Chỉnh Sửa Cấu Hình' : 'Tạo Cấu Hình Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl mb-4">
                <h3 className="text-sm font-bold text-blue-800 mb-3">1. Cấu hình Hạng (Tiêu chí đạt)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Hạng Áp Dụng</label>
                    <select value={formData.targetTierName} onChange={e => setFormData({...formData, targetTierName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition">
                      <option>Bạc</option>
                      <option>Vàng</option>
                      <option>Kim Cương</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Mức Chi Tiêu Cần Đạt (VND) *</label>
                    <input required type="number" min="0" value={formData.requiredSpending} onChange={e => setFormData({...formData, requiredSpending: Number(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition" placeholder="VD: 1000000" />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
                <h3 className="text-sm font-bold text-emerald-800 mb-3">2. Phần thưởng Voucher</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Mã Voucher *</label>
                    <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition uppercase" placeholder="VD: GOLD2026" />
                  </div>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Loại Giảm Giá</label>
                  <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition">
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền (VND)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Giá Trị Giảm</label>
                  <input required type="number" min="1" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition" />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Đơn Tối Thiểu (VND)</label>
                  <input type="number" min="0" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Thời Hạn Sử Dụng (Ngày)</label>
                  <input required type="number" min="1" value={formData.validDays} onChange={e => setFormData({...formData, validDays: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    Số Lượng Cấp Phát <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px]">issueQuantity</span>
                  </label>
                  <p className="text-sm text-slate-500 mb-3">Số lượng bản sao voucher sẽ tự động phát cho User vào thời điểm họ vừa đạt hạng này.</p>
                  <input required type="number" min="1" value={formData.issueQuantity} onChange={e => setFormData({...formData, issueQuantity: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition" />
                </div>
              </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-2xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition">Hủy</button>
                <button type="submit" className="px-8 py-3 rounded-2xl text-white font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition">
                  {editingVoucher ? 'Lưu Thay Đổi' : 'Tạo Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
