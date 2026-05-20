import React, { useState } from 'react';
import { Search, User, Mail, Phone, Shield, Eye, X, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, AdminUserResponse } from '../../services/admin.service';
import toast from 'react-hot-toast';

const ROLE_LABEL: Record<string, string> = {
  USER: 'Khách hàng', SHOP_OWNER: 'Chủ shop', STAFF: 'Nhân viên', ADMIN: 'Admin',
};
const ROLE_COLOR: Record<string, string> = {
  USER: 'bg-slate-100 text-slate-600',
  SHOP_OWNER: 'bg-blue-100 text-blue-700',
  STAFF: 'bg-indigo-100 text-indigo-700',
  ADMIN: 'bg-red-100 text-red-700',
};

export default function AdminMembers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tất cả');
  const [detail, setDetail] = useState<AdminUserResponse | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['admin-members'],
    queryFn: adminService.getAllUsers,
    staleTime: 0,
  });

  const deactivateMutation = useMutation({
    mutationFn: adminService.deactivateUser,
    onSuccess: (_, userId) => {
      toast.success('Đã khóa tài khoản');
      qc.setQueryData<AdminUserResponse[]>(['admin-members'], old =>
        old?.map(m => m.id === userId ? { ...m, isActive: false } : m) ?? []
      );
    },
    onError: () => toast.error('Khóa thất bại'),
  });

  const activateMutation = useMutation({
    mutationFn: adminService.activateUser,
    onSuccess: (_, userId) => {
      toast.success('Đã mở khóa tài khoản');
      qc.setQueryData<AdminUserResponse[]>(['admin-members'], old =>
        old?.map(m => m.id === userId ? { ...m, isActive: true } : m) ?? []
      );
    },
    onError: () => toast.error('Mở khóa thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => { toast.success('Đã xóa tài khoản'); qc.invalidateQueries({ queryKey: ['admin-members'] }); setDetail(null); },
    onError: () => toast.error('Xóa thất bại'),
  });

  const filtered = members.filter(m => {
    const matchSearch = m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const role = m.roles?.[0]?.name ?? 'USER';
    const matchRole = roleFilter === 'Tất cả' ? true : role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Quản lý Member</h1>
        <p className="text-slate-500 text-sm mt-1">Danh sách tất cả người dùng</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Tất cả', 'USER', 'SHOP_OWNER', 'STAFF', 'ADMIN'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all
                ${roleFilter === r ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {r === 'Tất cả' ? 'Tất cả' : ROLE_LABEL[r]}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm shrink-0">
          {filtered.length} thành viên
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <User size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Không tìm thấy thành viên nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Thành viên</th>
                  <th className="px-6 py-3 text-left hidden md:table-cell">Email</th>
                  <th className="px-6 py-3 text-left hidden lg:table-cell">Số điện thoại</th>
                  <th className="px-6 py-3 text-left">Vai trò</th>
                  <th className="px-6 py-3 text-left">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(m => {
                  const role = m.roles?.[0]?.name ?? 'USER';
                  const isActive = m.isActive !== false;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {m.avatar ? (
                            <img src={m.avatar} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                              {(m.fullName || m.email).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-slate-800">{m.fullName || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 hidden md:table-cell">{m.email}</td>
                      <td className="px-6 py-4 text-slate-500 hidden lg:table-cell">{m.phone || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLOR[role] ?? ROLE_COLOR.USER}`}>
                          {ROLE_LABEL[role] ?? role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isActive ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isActive ? (
                            <button onClick={() => deactivateMutation.mutate(m.id)} disabled={deactivateMutation.isPending}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50">
                              <Ban size={15} />
                            </button>
                          ) : (
                            <button onClick={() => activateMutation.mutate(m.id)} disabled={activateMutation.isPending}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-400 hover:text-green-600 transition-colors disabled:opacity-50">
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button onClick={() => setDetail(m)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Chi tiết thành viên</h3>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                {detail.avatar ? (
                  <img src={detail.avatar} className="w-16 h-16 rounded-2xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-500 text-2xl font-bold">
                    {(detail.fullName || detail.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900 text-lg">{detail.fullName || '—'}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLOR[detail.roles?.[0]?.name ?? 'USER']}`}>
                      {ROLE_LABEL[detail.roles?.[0]?.name ?? 'USER']}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${detail.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {detail.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </div>
                </div>
              </div>
              {[
                { icon: Mail, label: detail.email },
                { icon: Phone, label: detail.phone || 'Chưa cập nhật' },
                { icon: Shield, label: `ID: ${detail.id}` },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-slate-600">
                  <Icon size={15} className="text-slate-400 shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
              {detail.address && (
                <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3">{detail.address}</p>
              )}
              <div className="flex gap-3 pt-2">
                {detail.isActive !== false ? (
                  <button onClick={() => {
                    deactivateMutation.mutate(detail.id);
                    setDetail(prev => prev ? { ...prev, isActive: false } : null);
                  }}
                    className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm">
                    <Ban size={15} /> Khóa tài khoản
                  </button>
                ) : (
                  <button onClick={() => {
                    activateMutation.mutate(detail.id);
                    setDetail(prev => prev ? { ...prev, isActive: true } : null);
                  }}
                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <CheckCircle size={15} /> Mở khóa
                  </button>
                )}
                <button onClick={() => { if (confirm('Xóa vĩnh viễn tài khoản này?')) deleteMutation.mutate(detail.id); }}
                  className="flex-1 py-3 bg-slate-600 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 text-sm">
                  <Trash2 size={15} /> Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
