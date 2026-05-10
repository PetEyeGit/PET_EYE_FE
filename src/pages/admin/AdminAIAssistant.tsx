import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown, ChevronUp, Sparkles, TrendingUp, Store, Users,
  Bell, MessageCircle, AlertTriangle, BarChart2, RefreshCw, Trash2,
  Shield, Clock
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { adminAIChatService } from '../../services/aiChat.service';

// ─── Gemini ───────────────────────────────────────────────────────────────────
const GEMINI_KEYS: string[] = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
].filter(Boolean) as string[];

const GEMINI_MODELS = ['gemini-2.5-flash','gemini-2.5-flash-lite','gemini-flash-latest','gemini-2.0-flash'];

async function callGeminiText(prompt: string): Promise<string> {
  if (!GEMINI_KEYS.length) return 'Chưa cấu hình API key.';
  const body = { contents:[{role:'user',parts:[{text:prompt}]}], generationConfig:{temperature:0.6,maxOutputTokens:2048} };
  for (const model of GEMINI_MODELS) {
    for (const key of GEMINI_KEYS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}
        );
        if (!res.ok){const s=res.status;if(s===429||s===503)continue;throw new Error(`HTTP ${s}`);}
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Không có phản hồi.';
      } catch { continue; }
    }
  }
  return 'Tất cả model đều không khả dụng. Quota hết hoặc lỗi mạng. Vui lòng thử lại sau.';
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message { id:string; role:'user'|'assistant'; content:string; timestamp:Date; isLoading?:boolean; }
function uid(){ return Math.random().toString(36).slice(2); }

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p,i)=>{
    if(p.startsWith('**')&&p.endsWith('**')) return <strong key={i} className="font-bold text-slate-900">{p.slice(2,-2)}</strong>;
    if(p.startsWith('*')&&p.endsWith('*')) return <em key={i} className="italic">{p.slice(1,-1)}</em>;
    if(p.startsWith('`')&&p.endsWith('`')) return <code key={i} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono border border-blue-100">{p.slice(1,-1)}</code>;
    return p;
  });
}

function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-slate-700">
      {lines.map((line,i)=>{
        if(!line.trim()) return <div key={i} className="h-1.5"/>;
        if(line.startsWith('### ')) return <p key={i} className="font-bold text-slate-900 text-sm mt-3 mb-1">{line.slice(4)}</p>;
        if(line.startsWith('## ')) return (
          <div key={i} className="flex items-center gap-2 mt-4 mb-2 pb-2 border-b border-slate-100">
            <div className="w-1 h-5 bg-blue-500 rounded-full"/>
            <p className="font-black text-slate-900 text-base">{line.slice(3)}</p>
          </div>
        );
        if(line.startsWith('# ')) return <p key={i} className="font-black text-blue-700 text-lg mt-4">{line.slice(2)}</p>;
        if(line.match(/^[-•*] /)) return (
          <div key={i} className="flex items-start gap-2.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"/>
            <span className="flex-1">{renderInline(line.slice(2))}</span>
          </div>
        );
        if(line.match(/^\d+\. /)) return (
          <div key={i} className="flex items-start gap-2.5 py-0.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{line.match(/^\d+/)?.[0]}</span>
            <span className="flex-1">{renderInline(line.replace(/^\d+\. /,''))}</span>
          </div>
        );
        if(line.startsWith('> ')) return (
          <div key={i} className="border-l-4 border-amber-400 pl-3 py-1.5 bg-amber-50 rounded-r-xl text-amber-800 text-xs italic my-1">{line.slice(2)}</div>
        );
        if(line.startsWith('---')) return <hr key={i} className="border-slate-100 my-2"/>;
        return <p key={i} className="leading-relaxed">{renderInline(line)}</p>;
      })}
    </div>
  );
}
// ─── Quick actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon:'📊', label:'Tổng quan hệ thống', color:'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    prompt:'Phân tích tổng quan hệ thống PetEye: doanh thu, người dùng, shop, booking. Nhận xét xu hướng và đề xuất cải thiện.' },
  { icon:'🏪', label:'Phân tích Shop', color:'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    prompt:'Phân tích tình trạng các shop: tổng số, đã duyệt, chờ duyệt, shop nào cần chú ý. Đề xuất chính sách quản lý shop.' },
  { icon:'⏳', label:'Shop chờ duyệt', color:'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    prompt:'Liệt kê và phân tích các shop đang chờ duyệt. Tiêu chí nào cần kiểm tra? Đề xuất quy trình duyệt nhanh hơn.' },
  { icon:'👥', label:'Phân tích Member', color:'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    prompt:'Phân tích người dùng: tổng số, phân loại theo role, tăng trưởng. Đề xuất chiến lược giữ chân và thu hút user mới.' },
  { icon:'💬', label:'Tình trạng tin nhắn', color:'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
    prompt:'Phân tích tin nhắn chưa đọc và tình trạng hỗ trợ khách hàng. Đề xuất cải thiện thời gian phản hồi.' },
  { icon:'⚠️', label:'Rủi ro & cảnh báo', color:'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    prompt:'Có rủi ro gì trong hệ thống? Shop vi phạm, user bất thường, doanh thu giảm, tin nhắn tồn đọng? Đề xuất xử lý ngay.' },
  { icon:'📋', label:'Chính sách đề xuất', color:'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    prompt:'Dựa trên dữ liệu thực tế, đề xuất các chính sách mới cho nền tảng PetEye: chính sách shop, user, thanh toán, chất lượng dịch vụ.' },
  { icon:'📈', label:'Chiến lược tăng trưởng', color:'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
    prompt:'Đề xuất 3-5 chiến lược cụ thể để tăng trưởng nền tảng PetEye trong quý tới: thu hút shop mới, tăng user, tăng booking.' },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon:React.ReactNode; label:string; value:string; sub?:string; color:string }) {
  return (
    <div className={`rounded-2xl p-4 border ${color} flex items-start gap-3`}>
      <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center shrink-0 shadow-sm">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 truncate">{label}</p>
        <p className="text-xl font-black leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-[10px] opacity-60 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}
// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminAIAssistant() {
  const WELCOME: Message = {
    id:'welcome', role:'assistant', timestamp:new Date(),
    content:`# Xin chào! Tôi là PetEye Admin AI 🛡️\n\nTôi phân tích dữ liệu **toàn hệ thống** để hỗ trợ quản trị:\n• **Dashboard** — tổng quan doanh thu, booking, tăng trưởng\n• **Shop** — phân tích, duyệt, chính sách quản lý\n• **Member** — thống kê user, phân loại, xu hướng\n• **Thông báo** — hiệu quả, tỷ lệ đọc, đề xuất nội dung\n• **Tin nhắn** — tình trạng hỗ trợ, thời gian phản hồi\n• **Rủi ro & Chính sách** — cảnh báo và đề xuất hành động\n\nChọn gợi ý bên dưới hoặc hỏi trực tiếp!`,
  };

  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Fetch data ───────────────────────────────────────────────────────────────
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['admin-dashboard-ai'],
    queryFn: adminService.getDashboard,
  });
  const { data: shops = [], refetch: refetchShops } = useQuery({
    queryKey: ['admin-shops-ai'],
    queryFn: adminService.getAllShops,
  });
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-ai'],
    queryFn: adminService.getAllUsers,
  });
  const { data: notifications } = useQuery({
    queryKey: ['admin-notifs-ai'],
    queryFn: () => adminService.getNotifications(0),
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);

  // ── Load history ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (historyLoaded) return;
    adminAIChatService.getHistory()
      .then(records => {
        if (records.length > 0) {
          const loaded: Message[] = records.map(r => ({
            id: String(r.id),
            role: r.role as 'user'|'assistant',
            content: r.content,
            timestamp: new Date(r.createdAt),
          }));
          setMessages(prev => [prev[0], ...loaded]);
        }
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [historyLoaded]);

  // ── Build context ─────────────────────────────────────────────────────────────
  const buildContext = useCallback(() => {
    const now = new Date();

    // Shop analysis
    const verifiedShops = shops.filter(s => s.isVerified);
    const pendingShops = shops.filter(s => !s.isVerified);
    const shopsByType = shops.reduce((acc: Record<string,number>, s) => {
      acc[s.shopType] = (acc[s.shopType]||0)+1; return acc;
    }, {});
    const topRatedShops = [...verifiedShops]
      .sort((a,b) => (b.ratingAvg||0)-(a.ratingAvg||0))
      .slice(0,5)
      .map(s => `${s.shopName}(${s.ratingAvg?.toFixed(1)||'N/A'}⭐, ${s.city})`);

    // User analysis
    const roleCount = users.reduce((acc: Record<string,number>, u) => {
      const role = u.roles?.[0]?.name || 'UNKNOWN';
      acc[role] = (acc[role]||0)+1; return acc;
    }, {});

    // Notification stats
    const notifList = notifications?.content ?? [];
    const totalNotifSent = notifList.reduce((s,n) => s+n.totalSent, 0);
    const totalNotifRead = notifList.reduce((s,n) => s+n.totalRead, 0);
    const readRate = totalNotifSent > 0 ? ((totalNotifRead/totalNotifSent)*100).toFixed(1) : '0';

    return `
=== DỮ LIỆU HỆ THỐNG PETEYE (${now.toLocaleDateString('vi-VN')}) ===

TỔNG QUAN:
- Tổng doanh thu: ${stats?.totalRevenue?.toLocaleString('vi-VN')??0}đ
- Tổng người dùng: ${stats?.totalUsers??0}
- Tổng shop: ${stats?.totalShops??0} (${verifiedShops.length} đã duyệt, ${pendingShops.length} chờ duyệt)
- Tổng booking: ${stats?.totalBookings??0}
- Tin nhắn chưa đọc: ${stats?.unreadMessages??0}

SHOP:
- Phân loại: ${Object.entries(shopsByType).map(([k,v])=>`${k}:${v}`).join(', ')||'Chưa có'}
- Top shop đánh giá cao: ${topRatedShops.join(', ')||'Chưa có'}
- Shop chờ duyệt: ${pendingShops.map(s=>`${s.shopName}(${s.city})`).join(', ')||'Không có'}
- Danh sách shop chờ: ${pendingShops.slice(0,10).map(s=>`${s.shopName} - ${s.email} - ${s.city}`).join(' | ')||'Không có'}

MEMBER:
- Tổng: ${users.length}
- Theo role: ${Object.entries(roleCount).map(([k,v])=>`${k}:${v}`).join(', ')||'Chưa có'}
- Danh sách role USER: ${users.filter(u=>u.roles?.[0]?.name==='USER').length} người
- Danh sách role SHOP_OWNER: ${users.filter(u=>u.roles?.[0]?.name==='SHOP_OWNER').length} người

THÔNG BÁO:
- Tổng thông báo đã gửi: ${notifList.length} chiến dịch
- Tổng lượt gửi: ${totalNotifSent}
- Tổng lượt đọc: ${totalNotifRead}
- Tỷ lệ đọc: ${readRate}%
- Thông báo gần đây: ${notifList.slice(0,5).map(n=>`"${n.title}"(${n.totalSent}gửi/${n.totalRead}đọc)`).join(', ')||'Chưa có'}

TIN NHẮN:
- Tin nhắn admin chưa đọc: ${stats?.unreadMessages??0}

=== HẾT DỮ LIỆU ===

Bạn là PetEye Admin AI — trợ lý quản trị hệ thống thông minh.
Trả lời bằng tiếng Việt, có cấu trúc rõ ràng, dùng emoji phù hợp.
Đưa ra nhận xét cụ thể dựa trên số liệu thực và đề xuất hành động có thể thực hiện ngay.
Khi phân tích rủi ro, hãy ưu tiên các vấn đề cần xử lý khẩn cấp trước.
`;
  }, [stats, shops, users, notifications]);

  // ── Send ──────────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;
    setInput('');
    const userMsg: Message = {id:uid(), role:'user', content, timestamp:new Date()};
    const loadMsg: Message = {id:uid(), role:'assistant', content:'', timestamp:new Date(), isLoading:true};
    setMessages(prev => [...prev, userMsg, loadMsg]);
    setIsLoading(true);

    adminAIChatService.saveMessage('user', content).catch(() => {});

    try {
      const resp = await callGeminiText(`${buildContext()}\n\nCÂU HỎI: ${content}`);
      setMessages(prev => prev.map(m => m.isLoading ? {...m, content:resp, isLoading:false} : m));
      adminAIChatService.saveMessage('assistant', resp).catch(() => {});
    } catch {
      setMessages(prev => prev.map(m => m.isLoading ? {...m, content:'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.', isLoading:false} : m));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, buildContext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const dataReady = !!stats;

  // ── Computed ──────────────────────────────────────────────────────────────────
  const pendingCount = shops.filter(s => !s.isVerified).length;
  const topShop = [...shops].sort((a,b) => (b.ratingAvg||0)-(a.ratingAvg||0))[0];

  const handleClearHistory = async () => {
    await adminAIChatService.clearHistory().catch(() => {});
    setMessages([WELCOME]);
  };

  const handleRefresh = () => {
    refetchStats();
    refetchShops();
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">Admin AI Assistant</h1>
            <p className="text-xs text-slate-500 mt-0.5">Phân tích & quản trị hệ thống PetEye</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!dataReady && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Clock size={11} /> Đang tải dữ liệu...
            </span>
          )}
          <button onClick={handleRefresh} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors" title="Làm mới dữ liệu">
            <RefreshCw size={16} />
          </button>
          <button onClick={handleClearHistory} className="p-2 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors" title="Xóa lịch sử">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 shrink-0 bg-white border-b border-slate-100">
        <StatCard icon={<TrendingUp size={16} className="text-blue-600" />} label="Doanh thu" value={stats ? (stats.totalRevenue/1_000_000).toFixed(1)+'M' : '—'} sub="tổng tích lũy" color="bg-blue-50 border-blue-100 text-blue-900" />
        <StatCard icon={<Users size={16} className="text-purple-600" />} label="Người dùng" value={stats?.totalUsers?.toLocaleString() ?? '—'} sub={`${users.filter(u=>u.roles?.[0]?.name==='USER').length} khách hàng`} color="bg-purple-50 border-purple-100 text-purple-900" />
        <StatCard icon={<Store size={16} className="text-indigo-600" />} label="Shop" value={stats?.totalShops?.toString() ?? '—'} sub={`${pendingCount} chờ duyệt`} color="bg-indigo-50 border-indigo-100 text-indigo-900" />
        <StatCard icon={<BarChart2 size={16} className="text-emerald-600" />} label="Booking" value={stats?.totalBookings?.toLocaleString() ?? '—'} sub="tổng đặt lịch" color="bg-emerald-50 border-emerald-100 text-emerald-900" />
        <StatCard icon={<Bell size={16} className="text-amber-600" />} label="Thông báo" value={(notifications?.content?.length ?? 0).toString()} sub={`${notifications?.totalElements ?? 0} tổng`} color="bg-amber-50 border-amber-100 text-amber-900" />
        <StatCard icon={<MessageCircle size={16} className="text-red-500" />} label="Tin nhắn" value={stats?.unreadMessages?.toString() ?? '—'} sub="chưa đọc" color={`${(stats?.unreadMessages ?? 0) > 0 ? 'bg-red-50 border-red-200 text-red-900' : 'bg-slate-50 border-slate-100 text-slate-700'}`} />
      </div>

      {/* Quick actions */}
      <div className="px-6 pt-3 pb-2 shrink-0 bg-white border-b border-slate-100">
        <button
          onClick={() => setShowQuickActions(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-2 transition-colors"
        >
          {showQuickActions ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          Gợi ý nhanh
        </button>
        {showQuickActions && (
          <div className="flex flex-wrap gap-2 pb-1">
            {QUICK_ACTIONS.map(a => (
              <button
                key={a.label}
                onClick={() => handleSend(a.prompt)}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 ${a.color}`}
              >
                <span>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Shield size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-white border border-slate-100 rounded-tl-sm'
            }`}>
              {msg.isLoading ? (
                <div className="flex items-center gap-2 py-1">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">Đang phân tích...</span>
                </div>
              ) : msg.role === 'user' ? (
                <p className="text-sm leading-relaxed text-white">{msg.content}</p>
              ) : (
                <RichText text={msg.content} />
              )}
              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <Shield size={14} className="text-slate-600" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0">
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            <AlertTriangle size={13} className="shrink-0" />
            <span><strong>{pendingCount} shop</strong> đang chờ duyệt.</span>
            <Link to="/admin/shops" className="ml-auto font-semibold underline hover:text-amber-900">Xem ngay →</Link>
          </div>
        )}
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về hệ thống, shop, member, thông báo, tin nhắn..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 max-h-32 overflow-y-auto"
            style={{minHeight:'44px'}}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all shadow-sm shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">Enter để gửi · Shift+Enter xuống dòng · Dữ liệu được cập nhật theo thời gian thực</p>
      </div>
    </div>
  );
}