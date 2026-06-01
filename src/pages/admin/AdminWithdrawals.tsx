import React, { useEffect } from 'react';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDownToLine, CheckCircle2, XCircle, Clock, Loader2,
  Building2, CreditCard, User, ChevronRight, Store,
  RefreshCw, Search, ExternalLink, X, Info, AlertCircle
} from 'lucide-react';
import { walletService, type WithdrawalRequestResponse } from '../../services/wallet.service';
import toast from 'react-hot-toast';
import { format, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';
import { vi } from 'date-fns/locale';
// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function formatDate(s: string) {
  try { return format(parseISO(s.replace(' ', 'T')), 'dd/MM/yyyy HH:mm', { locale: vi }); }
  catch { return s; }
}

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:  { label: 'Chờ duyệt',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',     icon: <Clock className="w-3.5 h-3.5" /> },
  PAYING:   { label: 'Đang chuyển', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',         icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  APPROVED: { label: 'Đã duyệt',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  REJECTED: { label: 'Từ chối',    color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300',              icon: <XCircle className="w-3.5 h-3.5" /> },
  EXPIRED:  { label: 'Hết hạn',    color: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',         icon: <Clock className="w-3.5 h-3.5" /> },
};

// ─── PayOS Modal ──────────────────────────────────────────────────────────────

function PayOSModal({ request, checkoutUrl, onConfirm, onClose, confirming }: {
  request: WithdrawalRequestResponse;
  checkoutUrl: string;
  onConfirm: () => void;
  onClose: () => void;
  confirming: boolean;
}) {
  const [opened, setOpened] = useState(false);

  const handleOpenPayOS = () => {
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    setOpened(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-lg">Chuyển tiền qua PayOS</h3>
            <p className="text-emerald-100 text-xs mt-0.5">
              {request.shopName} — {formatVND(request.amount)}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Bank info */}
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: <Building2 className="w-4 h-4" />, label: 'Ngân hàng', value: request.bankName },
              { icon: <CreditCard className="w-4 h-4" />, label: 'Số tài khoản', value: request.bankAccount },
              { icon: <User className="w-4 h-4" />, label: 'Chủ tài khoản', value: request.accountHolder },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <span className="text-slate-400">{item.icon}</span>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">{item.label}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Amount highlight */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 text-center">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Số tiền chuyển</p>
            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{formatVND(request.amount)}</p>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${opened ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500/20' : 'border-slate-100 dark:border-slate-700'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${opened ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                {opened ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Mở PayOS và hoàn tất chuyển khoản</p>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${opened ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500/20' : 'border-slate-100 dark:border-slate-700 opacity-50'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${opened ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>2</div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Xác nhận đã chuyển tiền thành công</p>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-500/20">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              Chỉ nhấn "Xác nhận đã chuyển" sau khi PayOS báo thanh toán thành công. Hệ thống sẽ tự động xác minh với PayOS.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleOpenPayOS}
              className="flex-1 py-3 rounded-2xl bg-[#1a2b4c] text-white text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {opened ? 'Mở lại PayOS' : 'Mở PayOS'}
            </button>
            <button
              onClick={onConfirm}
              disabled={!opened || confirming}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Xác nhận đã chuyển
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ request, onClose, onApprove, onReject, approving, rejecting }: {
  request: WithdrawalRequestResponse;
  onClose: () => void;
  onApprove: (id: number, note: string, type: string) => void;
  onReject: (id: number, note: string, type: string) => void;
  approving: boolean;
  rejecting: boolean;
}) {
  const [adminNote, setAdminNote] = useState('');
  const meta = STATUS_META[request.status] ?? STATUS_META.PENDING;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a2b4c] to-slate-700 px-6 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-black text-lg">Chi tiết yêu cầu rút tiền</h3>
              <p className="text-slate-300 text-xs mt-0.5">#{request.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${meta.color}`}>
                {meta.icon}{meta.label}
              </span>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Shop */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cửa hàng</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{request.shopName}</p>
            </div>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-2xl border border-teal-100 dark:border-teal-500/20">
              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider mb-1">Số tiền</p>
              <p className="text-xl font-black text-teal-700 dark:text-teal-300">{formatVND(request.amount)}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Ngày tạo</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(request.createdAt)}</p>
            </div>
          </div>

          {/* Bank info */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin ngân hàng</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { icon: <Building2 className="w-3.5 h-3.5" />, label: 'Ngân hàng', value: request.bankName },
                { icon: <CreditCard className="w-3.5 h-3.5" />, label: 'Số TK', value: request.bankAccount },
                { icon: <User className="w-3.5 h-3.5" />, label: 'Chủ TK', value: request.accountHolder },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400">{item.label}</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shop note */}
          {request.note && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú từ shop</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 italic">"{request.note}"</p>
            </div>
          )}

          {/* Admin note (if processed) */}
          {request.adminNote && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú Admin</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 border border-blue-100 dark:border-blue-500/20">
                {request.adminNote}
              </p>
              {request.processedAt && (
                <p className="text-xs text-slate-400 mt-1">Xử lý: {formatDate(request.processedAt)}</p>
              )}
            </div>
          )}

          {/* Admin action input (PENDING only) */}
          {request.status === 'PENDING' && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú Admin (tuỳ chọn)</p>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Nhập ghi chú khi duyệt/từ chối..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#1a2b4c]/20 dark:text-white transition-all resize-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-1">
            {request.status === 'PENDING' ? (
              request.type === 'REFUND' ? (
                <button
                  onClick={() => onApprove(request.id, adminNote, request.type)}
                  disabled={approving}
                  className="w-full py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Xác nhận đã hoàn tiền
                </button>
              ) : (
              <>
                <button
                  onClick={() => onReject(request.id, adminNote, request.type)}
                  disabled={rejecting}
                  className="flex-1 py-3 rounded-2xl border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Từ chối
                </button>
                <button
                  onClick={() => onApprove(request.id, adminNote, request.type)}
                  disabled={approving}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Duyệt & Chuyển tiền
                </button>
              </>
              )
            ) : (
              <button onClick={onClose} className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminWithdrawals() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequestResponse | null>(null);
  const [payosModal, setPayosModal] = useState<{ request: WithdrawalRequestResponse; checkoutUrl: string } | null>(null);

  // ─── Xử lý redirect từ PayOS ────────────────────────────────────────────────
  // PayOS cancel → ?cancelled=true&withdrawalId=xxx
  // PayOS paid   → ?paid=true&orderCode=xxx

  useEffect(() => {
    const cancelled    = searchParams.get('cancelled');
    const paid         = searchParams.get('paid');
    const withdrawalId = searchParams.get('withdrawalId');
    const orderCode    = searchParams.get('orderCode');

    if (cancelled === 'true' && withdrawalId) {
      // Admin đã cancel trong PayOS → tự động regenerate link mới
      toast('Link PayOS đã bị huỷ. Đang tạo link mới...', { icon: '🔄' });
      regenerateMutation.mutate(parseInt(withdrawalId));
      // Xoá query params khỏi URL
      setSearchParams({}, { replace: true });
    } else if (paid === 'true' && orderCode) {
      // Admin đã thanh toán thành công → tự động confirm
      toast('Đang xác nhận thanh toán...', { icon: '⏳' });
      confirmMutation.mutate(parseInt(orderCode));
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // chỉ chạy 1 lần khi mount

  // ─── Queries ────────────────────────────────────────────────────────────────

  const { data: withdrawals = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-withdrawals', filterStatus],
    queryFn: async () => {
      if (filterStatus === 'ALL' || filterStatus === 'PENDING') {
        const [w, r] = await Promise.all([
          walletService.getAllWithdrawals(filterStatus === 'ALL' ? undefined : filterStatus),
          walletService.getWaitingRefunds()
        ]);
        return [...w, ...r].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        return walletService.getAllWithdrawals(filterStatus);
      }
    },
    staleTime: 30_000,
    refetchInterval: 15_000,
  });

  const { data: adminBalance = 0 } = useQuery({
    queryKey: ['admin-balance'],
    queryFn: walletService.getAdminBalance,
    staleTime: 60_000,
  });

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const approveMutation = useMutation({
    mutationFn: ({ id, note, type }: { id: number; note: string; type: string }) => {
      if (type === 'REFUND') {
        return walletService.confirmRefundForBooking(id);
      }
      return walletService.approveWithdrawal(id, note);
    },
    onSuccess: (data: any, variables) => {
      if (variables.type === 'REFUND') {
        toast.success('Đã xác nhận hoàn tiền cho khách hàng');
        qc.invalidateQueries({ queryKey: ['admin-withdrawals'] });
        setSelectedRequest(null);
      } else {
        toast.success('Đã tạo link PayOS — vui lòng hoàn tất chuyển khoản');
        qc.invalidateQueries({ queryKey: ['admin-withdrawals'] });
        setSelectedRequest(null);
        // Mở PayOS modal
        if (data?.checkoutUrl) {
          setPayosModal({ request: data, checkoutUrl: data.checkoutUrl });
        }
      }
    },
    onError: (err: any) => {
      const code = err.response?.data?.code;
      if (code === 5007) toast.error('Lỗi kết nối PayOS');
      else toast.error('Xử lý thất bại');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note, type }: { id: number; note: string; type: string }) => {
      if (type === 'REFUND') return Promise.reject(new Error('Cannot reject refund'));
      return walletService.rejectWithdrawal(id, note);
    },
    onSuccess: () => {
      toast.success('Đã từ chối yêu cầu, tiền đã hoàn lại ví shop');
      qc.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      setSelectedRequest(null);
    },
    onError: () => toast.error('Từ chối thất bại'),
  });

  const confirmMutation = useMutation({
    mutationFn: (orderCode: number) => walletService.confirmPayout(orderCode),
    onSuccess: () => {
      toast.success('✅ Xác nhận thành công! Tiền đã được ghi nhận.');
      qc.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      qc.invalidateQueries({ queryKey: ['admin-balance'] });
      setPayosModal(null);
    },
    onError: (err: any) => {
      const code = err.response?.data?.code;
      if (code === 5007) toast.error('Lỗi kết nối PayOS — vui lòng thử lại');
      else if (code === 5001) toast.error('PayOS chưa ghi nhận thanh toán — vui lòng đợi vài giây rồi thử lại');
      else toast.error('Xác nhận thất bại');
    },
  });

  // Tạo lại PayOS link mới khi link cũ đã bị huỷ/hết hạn
  const regenerateMutation = useMutation({
    mutationFn: (id: number) => walletService.regeneratePayoutLink(id),
    onSuccess: (data) => {
      toast.success('Đã tạo link PayOS mới');
      qc.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      if (data.checkoutUrl) {
        setPayosModal({ request: data, checkoutUrl: data.checkoutUrl });
      }
    },
    onError: (err: any) => {
      const code = err.response?.data?.code;
      if (code === 5007) toast.error('Lỗi kết nối PayOS');
      else toast.error('Không thể tạo lại link PayOS');
    },
  });

  const expireStaleMutation = useMutation({
    mutationFn: walletService.expireStale,
    onSuccess: () => {
      toast.success('Đã kiểm tra và expire các yêu cầu quá hạn');
      qc.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      qc.invalidateQueries({ queryKey: ['admin-balance'] });
    },
    onError: () => toast.error('Thao tác thất bại'),
  });
  // ─── Derived data ────────────────────────────────────────────────────────────

  const filtered = withdrawals.filter(w =>
    w.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.bankAccount.includes(searchTerm) ||
    w.accountHolder.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount  = withdrawals.filter(w => w.status === 'PENDING').length;
  const payingCount   = withdrawals.filter(w => w.status === 'PAYING').length;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowDownToLine className="w-6 h-6 text-teal-500" />
            Quản lý rút tiền
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Duyệt yêu cầu và chuyển tiền cho shop qua PayOS
          </p>
        </div>
        <div className="flex items-center gap-2">
          {payingCount > 0 && (
            <button
              onClick={() => expireStaleMutation.mutate()}
              disabled={expireStaleMutation.isPending}
              title="Expire thủ công các PAYING quá 24h"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 rounded-xl text-sm font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all disabled:opacity-50"
            >
              {expireStaleMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Clock className="w-4 h-4" />}
              Expire quá hạn
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-500/20 col-span-2 sm:col-span-1">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Ví Admin (Phí hoa hồng)</p>
          <p className="text-xl font-black">{formatVND(adminBalance)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chờ duyệt</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Đang chuyển</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{payingCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng yêu cầu</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{withdrawals.length}</p>
        </div>
      </div>

      {/* PAYING alert — nhắc admin có giao dịch đang chờ xác nhận */}
      {payingCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-500/30">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            Có <span className="font-black">{payingCount}</span> giao dịch đang chờ xác nhận PayOS.
            {' '}
            <button
              onClick={() => setFilterStatus('PAYING')}
              className="underline font-bold hover:no-underline"
            >
              Xem ngay
            </button>
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm shop, số TK, chủ TK..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a2b4c]/10 dark:text-white transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 flex-wrap">
            {(['PENDING', 'PAYING', 'APPROVED', 'REJECTED', 'EXPIRED', 'ALL'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                  filterStatus === s
                    ? 'bg-[#1a2b4c] text-white border-[#1a2b4c]'
                    : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'
                }`}
              >
                {s === 'ALL' ? 'Tất cả'
                  : s === 'PENDING' ? 'Chờ duyệt'
                  : s === 'PAYING' ? 'Đang chuyển'
                  : s === 'APPROVED' ? 'Đã duyệt'
                  : s === 'EXPIRED' ? 'Hết hạn'
                  : 'Từ chối'}
                {s === 'PENDING' && pendingCount > 0 && (
                  <span className="ml-1 bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-[8px]">{pendingCount}</span>
                )}
                {s === 'PAYING' && payingCount > 0 && (
                  <span className="ml-1 bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-[8px]">{payingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-medium">Đang tải...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
            <ArrowDownToLine className="w-10 h-10 opacity-30 mb-3" />
            <p className="font-bold">Không có yêu cầu nào</p>
            <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {filtered.map(w => {
              const meta = STATUS_META[w.status] ?? STATUS_META.PENDING;
              const isPaying = w.status === 'PAYING';
              return (
                <div
                  key={w.id}
                  className={`flex items-start gap-4 px-6 py-5 transition-colors ${isPaying ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                    w.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : w.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-500/20 text-red-500'
                    : w.status === 'PAYING'   ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    <ArrowDownToLine className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${meta.color}`}>
                        {meta.icon}{meta.label}
                      </span>
                      <span className="text-xs font-bold text-slate-400 font-mono">#{w.id}</span>
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{w.shopName}</p>
                    <p className="text-lg font-black text-teal-600 dark:text-teal-400 mb-1">{formatVND(w.amount)}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Building2 className="w-3 h-3" />{w.bankName}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><CreditCard className="w-3 h-3" />{w.bankAccount}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><User className="w-3 h-3" />{w.accountHolder}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-xs text-slate-400">{formatDate(w.createdAt)}</p>
                    {/* Countdown hết hạn cho PAYING */}
                    {w.status === 'PAYING' && (() => {
                      try {
                        const expireAt = new Date(parseISO(w.createdAt.replace(' ', 'T')).getTime() + 24 * 60 * 60 * 1000);
                        const h = differenceInHours(expireAt, new Date());
                        const m = differenceInMinutes(expireAt, new Date()) % 60;
                        if (h < 0) return <p className="text-[10px] text-red-400 font-bold">Đã hết hạn</p>;
                        return (
                          <p className={`text-[10px] font-bold ${h < 4 ? 'text-red-500' : 'text-amber-500'}`}>
                            ⏱ Hết hạn sau {h}h {m}m
                          </p>
                        );
                      } catch { return null; }
                    })()}
                    {w.status === 'EXPIRED' && (
                      <p className="text-[10px] text-slate-400 italic">Đã hoàn tiền về shop</p>
                    )}
                    {w.status === 'PENDING' && (
                      <button
                        onClick={() => setSelectedRequest(w)}
                        className="flex items-center gap-1 text-xs font-bold text-[#1a2b4c] dark:text-teal-400 hover:underline"
                      >
                        Xem & Duyệt <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {w.status === 'PAYING' && w.checkoutUrl && (
                      <button
                        onClick={() => setPayosModal({ request: w, checkoutUrl: w.checkoutUrl! })}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Tiếp tục chuyển <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(w.status === 'APPROVED' || w.status === 'REJECTED') && (
                      <button
                        onClick={() => setSelectedRequest(w)}
                        className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:underline"
                      >
                        Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <DetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={(id, note, type) => approveMutation.mutate({ id, note, type })}
          onReject={(id, note, type) => rejectMutation.mutate({ id, note, type })}
          approving={approveMutation.isPending}
          rejecting={rejectMutation.isPending}
        />
      )}

      {/* PayOS Modal */}
      {payosModal && (
        <PayOSModal
          request={payosModal.request}
          checkoutUrl={payosModal.checkoutUrl}
          onClose={() => setPayosModal(null)}
          onConfirm={() => {
            if (payosModal.request.payosOrderCode) {
              confirmMutation.mutate(payosModal.request.payosOrderCode);
            }
          }}
          confirming={confirmMutation.isPending}
        />
      )}
    </div>
  );
}
