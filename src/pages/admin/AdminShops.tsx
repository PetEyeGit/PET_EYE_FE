import React, { useState } from 'react';
import {
  Search, CheckCircle, Clock, ChevronRight, Users,
  Store, Eye, X, Phone, Mail, MapPin, Shield, XCircle, FileText
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, AdminShopResponse, AdminStaffResponse } from '../../services/admin.service';
import toast from 'react-hot-toast';

const STATUS_FILTER = ['Tất cả', 'Đã duyệt', 'Chờ duyệt'];

export default function AdminShops() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [expandedShop, setExpandedShop] = useState<number | null>(null);
  const [detailShop, setDetailShop] = useState<AdminShopResponse | null>(null);
  const [staffMap, setStaffMap] = useState<Record<number, AdminStaffResponse[]>>({});
  const [loadingStaff, setLoadingStaff] = useState<number | null>(null);

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: adminService.getAllShops,
  });

  const approveMutation = useMutation({
    mutationFn: adminService.approveShop,
    onSuccess: () => { toast.success('Đã phê duyệt shop'); qc.invalidateQueries({ queryKey: ['admin-shops'] }); qc.invalidateQueries({ queryKey: ['admin-dashboard'] }); },
    onError: () => toast.error('Phê duyệt thất bại'),
  });

  const rejectMutation = useMutation({
    mutationFn: adminService.rejectShop,
    onSuccess: () => { toast.success('Đã từ chối shop'); qc.invalidateQueries({ queryKey: ['admin-shops'] }); },
    onError: () => toast.error('Từ chối thất bại'),
  });

  const filtered = shops.filter(s => {
    const matchSearch = s.shopName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' ? true
      : statusFilter === 'Đã duyệt' ? s.isVerified : !s.isVerified;
    return matchSearch && matchStatus;
  });

  const toggleExpand = async (shopId: number) => {
    if (expandedShop === shopId) { setExpandedShop(null); return; }
    setExpandedShop(shopId);
    if (!staffMap[shopId]) {
      setLoadingStaff(shopId);
      try {
        const staff = await adminService.getShopStaff(shopId);
        setStaffMap(prev => ({ ...prev, [shopId]: staff }));
      } catch {
        setStaffMap(prev => ({ ...prev, [shopId]: [] }));
      } finally {
        setLoadingStaff(null);
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Quản lý Shop</h1>
        <p className="text-slate-500 text-sm mt-1">Xem, duyệt và quản lý tất cả cửa hàng</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
        <div className="flex gap-2">
          {STATUS_FILTER.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all
                ${statusFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng shop', value: shops.length },
          { label: 'Đã duyệt', value: shops.filter(s => s.isVerified).length },
          { label: 'Chờ duyệt', value: shops.filter(s => !s.isVerified).length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Không có shop nào</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(shop => (
              <div key={shop.id}>
                <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Store size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 text-sm truncate">{shop.shopName}</p>
                      {shop.isVerified
                        ? <CheckCircle size={14} className="text-green-500 shrink-0" />
                        : <Clock size={14} className="text-yellow-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{shop.shopType} • {shop.city}</p>
                  </div>
                  <div className="hidden md:block text-xs text-slate-500 min-w-[140px] truncate">{shop.email}</div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!shop.isVerified && (
                      <>
                        <button onClick={() => approveMutation.mutate(shop.id)} disabled={approveMutation.isPending}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1">
                          <CheckCircle size={12} /> Duyệt
                        </button>
                        <button onClick={() => rejectMutation.mutate(shop.id)} disabled={rejectMutation.isPending}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1">
                          <XCircle size={12} /> Từ chối
                        </button>
                      </>
                    )}
                    <button onClick={() => setDetailShop(shop)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => toggleExpand(shop.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors">
                      <Users size={13} />
                      <span className="hidden sm:inline">Nhân viên</span>
                      <ChevronRight size={13} className={`transition-transform ${expandedShop === shop.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Staff expand */}
                {expandedShop === shop.id && (
                  <div className="bg-slate-50 border-t border-slate-100 px-6 py-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Nhân viên của {shop.shopName}</p>
                    {loadingStaff === shop.id ? (
                      <p className="text-xs text-slate-400">Đang tải...</p>
                    ) : (staffMap[shop.id] ?? []).length === 0 ? (
                      <p className="text-xs text-slate-400">Chưa có nhân viên nào</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(staffMap[shop.id] ?? []).map(st => (
                          <div key={st.id} className="bg-white rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                              {st.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-800 truncate">{st.fullName}</p>
                              <p className="text-[11px] text-slate-400 truncate">{st.role || st.specialization || 'Nhân viên'}</p>
                              {st.email && <p className="text-[11px] text-slate-400 truncate">{st.email}</p>}
                            </div>
                            <span className={`shrink-0 w-2 h-2 rounded-full ${st.isActive ? 'bg-green-400' : 'bg-slate-300'}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">{detailShop.shopName}</h3>
              <button onClick={() => setDetailShop(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${detailShop.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {detailShop.isVerified ? 'Đã xác minh' : 'Chờ duyệt'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{detailShop.shopType}</span>
                {detailShop.ratingAvg > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">⭐ {detailShop.ratingAvg.toFixed(1)}</span>
                )}
              </div>
              {[
                { icon: Mail, label: detailShop.email },
                { icon: Phone, label: detailShop.phone },
                { icon: MapPin, label: `${detailShop.address}, ${detailShop.city}` },
                { icon: FileText, label: `Giấy phép: ${detailShop.licenseNumber}` },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-slate-600">
                  <Icon size={15} className="text-slate-400 shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
              {detailShop.description && (
                <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3">{detailShop.description}</p>
              )}
              {detailShop.licenseImageUrl && (
                <img src={detailShop.licenseImageUrl} alt="Giấy phép" className="w-full rounded-xl object-cover max-h-48" />
              )}
              {!detailShop.isVerified && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { approveMutation.mutate(detailShop.id); setDetailShop(null); }}
                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <Shield size={15} /> Phê duyệt
                  </button>
                  <button onClick={() => { rejectMutation.mutate(detailShop.id); setDetailShop(null); }}
                    className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm">
                    <XCircle size={15} /> Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
