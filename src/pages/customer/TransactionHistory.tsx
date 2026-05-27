import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../../services/transaction.service';
import type { TransactionResponse } from '../../types/api';
import { format } from 'date-fns';

export default function TransactionHistory() {
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['my-transactions'],
    queryFn: transactionService.getMyTransactions,
  });

  const filteredTx = transactions.filter(tx => {
    if (filter === 'ALL') return true;
    return tx.status === filter;
  });

  const handleDownloadPdf = async () => {
    // Sử dụng trình duyệt native để in ra PDF (hỗ trợ oklch, font đẹp, sắc nét 100%)
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600 bg-green-50 border-green-200';
      case 'FAILED': return 'text-red-600 bg-red-50 border-red-200';
      case 'CANCELLED': return 'text-slate-600 bg-slate-50 border-slate-200';
      case 'PENDING': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'Thành công';
      case 'FAILED': return 'Thất bại';
      case 'CANCELLED': return 'Đã hủy';
      case 'PENDING': return 'Đang xử lý';
      default: return status;
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Lịch sử giao dịch</h1>
        <p className="text-slate-500 mt-2">Theo dõi các khoản thanh toán và hoàn tiền của bạn</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              filter === f 
                ? 'bg-[#1a2b4c] text-white shadow-lg' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'ALL' ? 'Tất cả' : getStatusLabel(f)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredTx.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">receipt_long</span>
          <p className="text-slate-500 font-medium">Không tìm thấy giao dịch nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTx.map(tx => (
            <div 
              key={tx.id} 
              onClick={() => setSelectedTx(tx)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">
                    {tx.type === 'REFUND' ? 'currency_exchange' : 'payment'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                    {tx.description || (tx.type === 'BOOKING_PAYMENT' ? `Thanh toán lịch hẹn #${tx.bookingId}` : 'Giao dịch')}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>{format(new Date(tx.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="uppercase">{tx.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div className="text-right">
                  <p className={`font-black text-lg ${tx.type === 'REFUND' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type === 'REFUND' ? '+' : ''}{tx.amount.toLocaleString()}đ
                  </p>
                  <span className={`inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(tx.status)}`}>
                    {getStatusLabel(tx.status)}
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors hidden sm:block">
                  chevron_right
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Biên lai */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 flex-shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-white">Chi tiết giao dịch</h3>
              <button 
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Vùng xuất PDF (Cho phép scroll nếu màn hình nhỏ) */}
            <div className="overflow-y-auto flex-1">
              <div ref={receiptRef} className="print-receipt p-6 sm:p-8 bg-white text-slate-900">
                <div className="text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 bg-[#1a2b4c] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl">pets</span>
                </div>
                <h2 className="text-2xl font-black text-[#1a2b4c]">PETEYE</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Biên lai điện tử</p>
              </div>

              <div className="text-center mb-8 pb-8 border-b border-dashed border-slate-300">
                <p className="text-sm text-slate-500 font-medium mb-1">Số tiền giao dịch</p>
                <p className="text-4xl font-black text-slate-900">{selectedTx.amount.toLocaleString()}đ</p>
                <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(selectedTx.status)}`}>
                  {getStatusLabel(selectedTx.status)}
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mã giao dịch</span>
                  <span className="font-bold text-slate-900 uppercase">{selectedTx.gatewayTransactionId || `TXN-${selectedTx.id}`}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Thời gian</span>
                  <span className="font-bold text-slate-900">{format(new Date(selectedTx.createdAt), 'dd/MM/yyyy HH:mm:ss')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Phương thức</span>
                  <span className="font-bold text-slate-900 uppercase">{selectedTx.paymentMethod}</span>
                </div>
                {selectedTx.shopName && (
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="text-slate-500">Cửa hàng</span>
                    <span className="font-bold text-slate-900">{selectedTx.shopName}</span>
                  </div>
                )}
                {selectedTx.serviceName && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Dịch vụ</span>
                    <span className="font-bold text-slate-900">{selectedTx.serviceName}</span>
                  </div>
                )}
                <div className="flex justify-between items-start pt-4 border-t border-slate-100">
                  <span className="text-slate-500">Nội dung</span>
                  <span className="font-bold text-slate-900 text-right max-w-[200px]">{selectedTx.description}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t-4 border-[#1a2b4c] text-center">
                <p className="text-xs text-slate-400">Cảm ơn bạn đã sử dụng dịch vụ của PetEye!</p>
                <p className="text-[10px] text-slate-300 mt-1">hotline: 1900 9999 - email: support@peteye.vn</p>
              </div>
            </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3 flex-shrink-0">
              <button 
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
              <button 
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#1a2b4c] shadow-lg shadow-[#1a2b4c]/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
              >
                {downloading ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">download</span>
                )}
                Tải biên lai PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
