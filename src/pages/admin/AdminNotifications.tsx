import React, { useState } from 'react';
import { Bell, Send, X, Plus, Trash2, Users, Store, Globe, User, Search, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';

type TargetType = 'SINGLE' | 'ALL_USERS' | 'ALL_SHOPS' | 'ALL';

interface NotifForm {
  title: string;
  content: string;
  targetType: TargetType;
  email: string;
}

const TARGET_OPTIONS: { value: TargetType; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'ALL',       label: 'Tất cả',     desc: 'Toàn bộ người dùng',             icon: <Globe size={16} /> },
  { value: 'ALL_USERS', label: 'Khách hàng', desc: 'Tất cả user có role USER',        icon: <Users size={16} /> },
  { value: 'ALL_SHOPS', label: 'Cửa hàng',   desc: 'Tất cả user có role SHOP_OWNER', icon: <Store size={16} /> },
  { value: 'SINGLE',    label: 'Cá nhân',    desc: 'Gửi cho 1 người theo email',     icon: <User size={16} /> },
];

const EMPTY_FORM: NotifForm = { title: '', content: '', targetType: 'ALL', email: '' };

export default function AdminNotifications() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NotifForm>(EMPTY_FORM);
  const [page, setPage] = useState(0);

  const { data: pagedData, isLoading } = useQuery({
    queryKey: ['admin-notifications', page],
    queryFn: () => adminService.getNotifications(page),
  });

  const broadcasts = pagedData?.content ?? [];
  const totalPages = pagedData?.totalPages ?? 0;
  const totalElements = pagedData?.totalElements ?? 0;

  const { data: users = [] } = useQuery({
    queryKey: ['admin-members'],
    queryFn: adminService.getAllUsers,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (form.targetType === 'SINGLE') {
        const found = users.find(u => u.email.toLowerCase() === form.email.trim().toLowerCase());
        if (!found) throw new Error('EMAIL_NOT_FOUND');
        return adminService.createNotification({
          title: form.title, content: form.content,
          targetType: 'SINGLE', userId: found.id,
        });
      }
      return adminService.createNotification({
        title: form.title, content: form.content, targetType: form.targetType,
      });
    },
    onSuccess: (msg) => {
      toast.success(msg || 'Đã gửi thông báo');
      qc.invalidateQueries({ queryKey: ['admin-notifications'] });
      setForm(EMPTY_FORM);
      setShowForm(false);
      setPage(0);
    },
    onError: (err: any) => {
      if (err.message === 'EMAIL_NOT_FOUND') { toast.error('Không tìm thấy người dùng với email này'); return; }
      const code = err.response?.data?.code;
      if (code === 10010) toast.error('Người dùng không tồn tại');
      else toast.error('Gửi thất bại');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (broadcastId: string) => adminService.deleteNotification(broadcastId),
    onSuccess: () => {
      toast.success('Đã xóa đợt thông báo');
      qc.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: () => toast.error('Xóa thất bại'),
  });

  const handleSend = () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Vui lòng điền tiêu đề và nội dung'); return; }
    if (form.targetType === 'SINGLE' && !form.email.trim()) { toast.error('Vui lòng nhập email người nhận'); return; }
    createMutation.mutate();
  };

  const emailSuggestions = form.targetType === 'SINGLE' && form.email.length > 1
    ? users.filter(u => u.email.toLowerCase().includes(form.email.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản lý Thông báo</h1>
          <p className="text-slate-500 text-sm mt-1">Gửi thông báo đến người dùng và cửa hàng</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={16} /> Tạo thông báo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Tổng đợt gửi', value: totalElements, color: 'text-slate-900' },
          { label: 'Trang hiện tại', value: `${page + 1} / ${totalPages || 1}`, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Broadcast list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Lịch sử đợt gửi</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Đang tải...</div>
        ) : broadcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Bell size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Chưa có thông báo nào</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-50">
              {broadcasts.map(b => (
                <div key={b.broadcastId} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm mb-0.5">{b.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{b.content}</p>
                    <p className="text-[11px] text-slate-400 mt-1.5">{new Date(b.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <button onClick={() => deleteMutation.mutate(b.broadcastId)} disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-red-400 transition-colors shrink-0 disabled:opacity-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">Trang {page + 1} / {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                    <ChevronLeft size={13} /> Trước
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                    Sau <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-slate-900">Tạo thông báo mới</h3>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Target */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Gửi đến</label>
                <div className="grid grid-cols-2 gap-2">
                  {TARGET_OPTIONS.map(t => (
                    <button key={t.value}
                      onClick={() => setForm(f => ({ ...f, targetType: t.value, email: '' }))}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all
                        ${form.targetType === t.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                        ${form.targetType === t.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {t.icon}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${form.targetType === t.value ? 'text-blue-700' : 'text-slate-700'}`}>{t.label}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email — chỉ khi SINGLE */}
              {form.targetType === 'SINGLE' && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Email người nhận</label>
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="Nhập email người nhận..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                  {emailSuggestions.length > 0 && (
                    <div className="mt-1 border border-slate-200 rounded-xl divide-y divide-slate-50 overflow-hidden">
                      {emailSuggestions.map(u => (
                        <button key={u.id} onClick={() => setForm(f => ({ ...f, email: u.email }))}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                            {(u.fullName || u.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{u.fullName || '—'}</p>
                            <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                          </div>
                          {u.email === form.email && <CheckCircle size={14} className="text-green-500 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Tiêu đề</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Nhập tiêu đề thông báo..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Nội dung</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Nhập nội dung thông báo..." rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Hủy
                </button>
                <button onClick={handleSend} disabled={createMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send size={15} />
                  {createMutation.isPending ? 'Đang gửi...' : 'Gửi ngay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
