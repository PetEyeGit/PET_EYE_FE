import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown, ChevronUp, Sparkles, TrendingUp, Calendar,
  Users, Scissors, AlertTriangle, BarChart2, RefreshCw, Trash2
} from 'lucide-react';
import { shopService } from '../../services/shop.service';
import { bookingService } from '../../services/booking.service';
import { staffService } from '../../services/staff.service';
import { serviceService } from '../../services/service.service';
import { useAIChat } from '../../hooks/useAIChat';
import { useShopTheme } from '../../contexts/ShopThemeContext';

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-bold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i} className="italic text-slate-700">{p.slice(1, -1)}</em>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono border border-indigo-100">{p.slice(1, -1)}</code>;
    return p;
  });
}

function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;
        if (line.startsWith('### ')) return <p key={i} className="font-bold text-slate-900 dark:text-white text-sm mt-3 mb-1">{line.slice(4)}</p>;
        if (line.startsWith('## ')) return (
          <div key={i} className="flex items-center gap-2 mt-4 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="w-1 h-5 bg-indigo-500 rounded-full" />
            <p className="font-black text-slate-900 dark:text-white text-base">{line.slice(3)}</p>
          </div>
        );
        if (line.startsWith('# ')) return <p key={i} className="font-black text-[#1a2b4c] dark:text-indigo-400 text-lg mt-4">{line.slice(2)}</p>;
        if (line.match(/^[-•*] /)) return (
          <div key={i} className="flex items-start gap-2.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
            <span className="flex-1">{renderInline(line.slice(2))}</span>
          </div>
        );
        if (line.match(/^\d+\. /)) return (
          <div key={i} className="flex items-start gap-2.5 py-0.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{line.match(/^\d+/)?.[0]}</span>
            <span className="flex-1">{renderInline(line.replace(/^\d+\. /, ''))}</span>
          </div>
        );
        if (line.startsWith('> ')) return (
          <div key={i} className="border-l-4 border-amber-400 pl-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-r-xl text-amber-800 dark:text-amber-300 text-xs italic my-1">{line.slice(2)}</div>
        );
        if (line.startsWith('---')) return <hr key={i} className="border-slate-100 dark:border-slate-700 my-2" />;
        return <p key={i} className="leading-relaxed">{renderInline(line)}</p>;
      })}
    </div>
  );
}

// ─── Quick actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '📊', label: 'Phân tích doanh thu', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20', prompt: 'Phân tích chi tiết doanh thu: tổng quan, xu hướng 7 ngày, dịch vụ đóng góp nhiều nhất. Đề xuất cải thiện cụ thể.' },
  { icon: '👑', label: 'Khách đặt nhiều nhất', color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20', prompt: 'Ai là khách hàng đặt lịch nhiều nhất? Liệt kê tên khách, số lần đặt, dịch vụ hay dùng. Đề xuất chương trình khách hàng thân thiết.' },
  { icon: '📅', label: 'Tổng quan lịch hẹn', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20', prompt: 'Tổng hợp lịch hẹn theo trạng thái (chờ/xác nhận/hoàn thành/hủy). Có lịch tồn đọng không? Đề xuất tối ưu.' },
  { icon: '✂️', label: 'Dịch vụ hot & kém', color: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20 hover:bg-teal-100 dark:hover:bg-teal-500/20', prompt: 'Dịch vụ nào được đặt nhiều nhất? Dịch vụ nào chưa ai đặt hoặc ít được chọn? Đề xuất chiến lược cải thiện.' },
  { icon: '👥', label: 'Thống kê nhân viên', color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20', prompt: 'Thống kê nhân viên: số lượng, trạng thái, chuyên môn, phân bổ công việc. Đề xuất tối ưu nhân sự.' },
  { icon: '⚠️', label: 'Cảnh báo & rủi ro', color: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20', prompt: 'Có vấn đề gì cần chú ý? Lịch tồn đọng, dịch vụ kém, nhân viên thiếu, doanh thu giảm? Đề xuất xử lý ngay.' },
  { icon: '🎯', label: 'Chiến lược tăng trưởng', color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 hover:bg-orange-100 dark:hover:bg-orange-500/20', prompt: 'Dựa trên dữ liệu thực, đề xuất 3-5 chiến lược cụ thể để tăng doanh thu và khách hàng trong tháng tới.' },
  { icon: '📈', label: 'So sánh tháng này vs trước', color: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-500/20', prompt: 'So sánh hiệu suất tháng này với tháng trước: doanh thu, lịch hẹn, khách hàng mới. Nhận xét xu hướng.' },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`rounded-2xl p-4 border ${color} flex items-start gap-3`}>
      <div className="w-9 h-9 rounded-xl bg-white/60 dark:bg-white/10 flex items-center justify-center shrink-0 shadow-sm">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 truncate">{label}</p>
        <p className="text-xl font-black leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-[10px] opacity-60 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const WELCOME_MSG = `# Xin chào! Tôi là PetEye Business AI 🤖\n\nTôi phân tích dữ liệu **thực tế** của shop để giúp bạn:\n• **Doanh thu** — xu hướng, dự báo, tối ưu\n• **Lịch hẹn** — tổng quan, tồn đọng, hiệu suất\n• **Dịch vụ** — hot nhất, kém nhất, cần cải thiện\n• **Khách hàng** — ai đặt nhiều nhất, chăm sóc VIP\n• **Nhân viên** — thống kê, phân bổ, tối ưu\n• **Chiến lược** — đề xuất hành động cụ thể\n\nChọn gợi ý bên dưới hoặc hỏi trực tiếp!`;

export default function ShopAIAssistant() {
  const { isDark } = useShopTheme();
  const { messages, isLoading, sendMessage, clearHistory } = useAIChat({
    agentType: 'SHOP_ASSISTANT',
    welcomeMessage: WELCOME_MSG,
  });

  const [input, setInput] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Stats still fetched on FE for the stat bar display
  const { data: dashboard, refetch: refetchDash } = useQuery({ queryKey: ['shopDashboard'], queryFn: () => shopService.getDashboard() });
  const { data: bookings = [], refetch: refetchBook } = useQuery({ queryKey: ['shopBookings-ai'], queryFn: () => bookingService.getShopBookings() });
  const { data: staff = [] } = useQuery({ queryKey: ['shopStaff-ai'], queryFn: () => staffService.getMyShopStaff() });
  const { data: services = [] } = useQuery({ queryKey: ['shopServices-ai'], queryFn: () => serviceService.getMyShopServices() });
  const { data: shopInfo } = useQuery({ queryKey: ['myShop-ai'], queryFn: () => shopService.getMyShop() });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput('');
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const dataReady = !!(dashboard && shopInfo);

  const topCustomer = (() => {
    if (!bookings.length) return null;
    const freq = bookings.reduce((acc: Record<string, number>, b) => {
      const k = b.petName || `User#${b.userId}`; acc[k] = (acc[k] || 0) + 1; return acc;
    }, {});
    const [name, count] = Object.entries(freq).sort((a, b) => b[1] - a[1])[0] ?? [];
    return name ? { name, count } : null;
  })();

  const topService = dashboard?.topServices?.[0];

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/20' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30'}`}>

      {/* Header */}
      <div className={`backdrop-blur-xl border-b px-6 py-4 sticky top-0 z-10 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1a2b4c] to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>PetEye Business AI</h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Trợ lý phân tích kinh doanh · Dữ liệu thực tế</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { refetchDash(); refetchBook(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
              <RefreshCw className="w-3.5 h-3.5" />Làm mới
            </button>
            <button onClick={clearHistory}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}>
              <Trash2 className="w-3.5 h-3.5" />Xoá lịch sử
            </button>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${dataReady ? (isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-700 border-green-200') : (isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200')}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dataReady ? 'bg-green-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
              {dataReady ? 'Dữ liệu sẵn sàng' : 'Đang tải...'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-5">

        {/* Stats row */}
        {dataReady && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard icon={<TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />} label="Doanh thu tháng"
              value={`${(dashboard!.revenueThisMonth / 1000000).toFixed(1)}M`} sub="đồng"
              color="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-400" />
            <StatCard icon={<Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />} label="Tổng lịch hẹn"
              value={`${dashboard!.totalBookings}`} sub={`${dashboard!.pendingBookings} đang chờ`}
              color="bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-900 dark:text-blue-400" />
            <StatCard icon={<Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />} label="Khách hàng"
              value={`${dashboard!.totalCustomers}`} sub={`${dashboard!.totalPets} thú cưng`}
              color="bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 text-purple-900 dark:text-purple-400" />
            <StatCard icon={<span className="text-sm">👑</span>} label="Khách VIP"
              value={topCustomer?.name?.slice(0, 10) ?? '—'} sub={topCustomer ? `${topCustomer.count} lần đặt` : 'Chưa có'}
              color="bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-900 dark:text-amber-400" />
            <StatCard icon={<Scissors className="w-4 h-4 text-teal-600 dark:text-teal-400" />} label="Dịch vụ hot"
              value={topService?.name?.slice(0, 10) ?? '—'} sub={topService ? `${topService.count} lần` : 'Chưa có'}
              color="bg-teal-50 dark:bg-teal-500/10 border-teal-100 dark:border-teal-500/20 text-teal-900 dark:text-teal-400" />
            <StatCard icon={<Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />} label="Nhân viên"
              value={`${staff.filter(s => s.isActive).length}/${staff.length}`} sub="đang hoạt động"
              color="bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-900 dark:text-indigo-400" />
          </div>
        )}

        {/* 2-col layout: chat + sidebar */}
        <div className="flex gap-5 flex-1 min-h-0">

          {/* Chat area */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">

            {/* Messages */}
            <div className={`flex-1 rounded-3xl border shadow-sm overflow-hidden flex flex-col ${isDark ? 'admin-glass-card bg-slate-900/40 border-white/10' : 'bg-white border-slate-100'}`} style={{ minHeight: '400px', maxHeight: 'calc(100vh - 420px)' }}>
              <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#1a2b4c] to-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <Sparkles className="text-white w-4 h-4" />
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <span className="text-white text-xs font-black">Bạn</span>
                      </div>
                    )}
                    <div className={`max-w-[85%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-[#1a2b4c] to-indigo-700 text-white rounded-tr-sm'
                        : (isDark ? 'bg-slate-800/50 border border-slate-700 rounded-tl-sm' : 'bg-slate-50 border border-slate-100 rounded-tl-sm')}`}>
                        {msg.isLoading ? (
                          <div className="flex items-center gap-3 py-1">
                            <div className="flex gap-1">
                              {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                            </div>
                            <span className="text-xs text-slate-400 italic">Đang phân tích dữ liệu shop...</span>
                          </div>
                        ) : msg.role === 'user' ? (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        ) : (
                          <RichText text={msg.content} />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 px-1">
                        {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input */}
            <div className={`rounded-2xl border shadow-sm focus-within:ring-2 transition-all ${isDark ? 'admin-glass-card bg-slate-900/60 border-white/10 focus-within:border-indigo-500 focus-within:ring-indigo-500/30' : 'bg-white border-slate-200 focus-within:border-indigo-400 focus-within:ring-indigo-100'}`}>
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Hỏi bất kỳ điều gì về shop... (Enter gửi, Shift+Enter xuống dòng)"
                disabled={isLoading} rows={2}
                className={`w-full px-4 pt-3 pb-1 text-sm bg-transparent outline-none resize-none ${isDark ? 'placeholder-slate-500 text-white' : 'placeholder-slate-400 text-slate-800'}`} />
              <div className="flex items-center justify-between px-4 pb-3">
                <p className="text-[10px] text-slate-400">Enter gửi · Shift+Enter xuống dòng</p>
                <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1a2b4c] to-indigo-600 text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
                  {isLoading
                    ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang phân tích...</>
                    : <><span className="material-symbols-outlined text-sm">send</span>Gửi</>}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar: Quick actions */}
          <div className="w-72 shrink-0 flex flex-col gap-3">
            <div className={`rounded-3xl border shadow-sm overflow-hidden ${isDark ? 'admin-glass-card bg-slate-900/40 border-white/10' : 'bg-white border-slate-100'}`}>
              <button onClick={() => setShowQuickActions(v => !v)}
                className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                    <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Phân tích nhanh</span>
                </div>
                {showQuickActions ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {showQuickActions && (
                <div className="px-3 pb-3 flex flex-col gap-1.5">
                  {QUICK_ACTIONS.map(action => (
                    <button key={action.label} onClick={() => handleSend(action.prompt)}
                      disabled={isLoading}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${action.color}`}>
                      <span className="text-base shrink-0">{action.icon}</span>
                      <span className="leading-snug">{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Data summary card */}
            {dataReady && (
              <div className="bg-gradient-to-br from-[#1a2b4c] to-indigo-700 rounded-3xl p-4 text-white shadow-lg shadow-indigo-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 className="w-4 h-4 text-indigo-300" />
                  <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Tóm tắt nhanh</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Tổng doanh thu', value: `${(dashboard!.totalRevenue / 1000000).toFixed(1)}M đ` },
                    { label: 'Lịch hẹn chờ', value: `${dashboard!.pendingBookings} lịch` },
                    { label: 'Dịch vụ active', value: `${services.filter(s => s.active).length} dịch vụ` },
                    { label: 'Nhân viên active', value: `${staff.filter(s => s.isActive).length} người` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-[11px] text-indigo-200">{item.label}</span>
                      <span className="text-xs font-bold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <Link to="/shop/dashboard" className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-200 hover:text-white transition-colors">
                    <BarChart2 className="w-3 h-3" />Xem Dashboard đầy đủ
                  </Link>
                </div>
              </div>
            )}

            {/* Tip */}
            <div className={`border rounded-2xl p-3 ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <div>
                  <p className={`text-[11px] font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Lưu ý</p>
                  <p className={`text-[10px] mt-0.5 leading-relaxed ${isDark ? 'text-amber-200/70' : 'text-amber-700'}`}>
                    AI phân tích dựa trên dữ liệu thực. Kết quả mang tính tham khảo, cần kết hợp với kinh nghiệm thực tế.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
