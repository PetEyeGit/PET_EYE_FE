import React, { useState, useEffect } from 'react';
import {
    ClipboardList, CheckCircle2, Clock, PlayCircle,
    ChevronRight, Loader2, RefreshCw, XCircle, Bell, Camera, 
    MessageCircle, Calendar, User, Zap, Star, ShieldCheck, 
    ArrowUpRight, Info, CheckCircle, Heart, Plus, Search,
    MoreVertical, ChevronLeft, LayoutGrid, List, SlidersHorizontal,
    X, Send, ImageIcon, Video
} from 'lucide-react';
import { taskService, type TaskResponse, type TaskStatus } from '../../services/task.service';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import ChatWindow from '../../components/chat/ChatWindow';
import { staffService } from '../../services/staff.service';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

/* ─── CONFIG & HELPERS ────────────────────────────────────────────────── */

const STATUS_CONFIG = {
    CONFIRMED: { 
        label: 'Chờ thực hiện', 
        color: 'text-amber-600 bg-amber-50 border-amber-100',
        icon: Clock,
        gradient: 'from-amber-500 to-orange-400',
        shadow: 'shadow-amber-200/40'
    },
    IN_PROGRESS: { 
        label: 'Đang làm', 
        color: 'text-blue-600 bg-blue-50 border-blue-100',
        icon: Zap,
        gradient: 'from-blue-600 to-indigo-500',
        shadow: 'shadow-blue-200/40'
    },
    COMPLETED: { 
        label: 'Hoàn thành', 
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        icon: CheckCircle2,
        gradient: 'from-emerald-600 to-teal-500',
        shadow: 'shadow-emerald-200/40'
    },
    CANCELLED: { 
        label: 'Đã hủy', 
        color: 'text-rose-600 bg-rose-50 border-rose-100',
        icon: XCircle,
        gradient: 'from-rose-600 to-pink-500',
        shadow: 'shadow-rose-200/40'
    },
    PENDING_PAYMENT: { 
        label: 'Chờ thanh toán', 
        color: 'text-slate-600 bg-slate-50 border-slate-100',
        icon: Clock,
        gradient: 'from-slate-600 to-slate-400',
        shadow: 'shadow-slate-200/40'
    },
} as const;

const NEXT_STATUS: Record<string, TaskStatus | null> = {
    CONFIRMED: 'IN_PROGRESS', 
    IN_PROGRESS: 'COMPLETED', 
    COMPLETED: null, 
    CANCELLED: null, 
    PENDING_PAYMENT: null,
};

const NEXT_LABEL: Record<string, string> = { 
    CONFIRMED: 'Bắt đầu ngay', 
    IN_PROGRESS: 'Hoàn thành công việc' 
};

const formatTime = (iso: string) => format(parseISO(iso), 'HH:mm', { locale: vi });
const formatDate = (iso: string) => format(parseISO(iso), 'dd/MM/yyyy', { locale: vi });

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────── */

export default function StaffDashboard() {
    const { user } = useAuth();
    const [myTasks, setMyTasks] = useState<TaskResponse[]>([]);
    const [poolTasks, setPoolTasks] = useState<TaskResponse[]>([]);
    const [activeTab, setActiveTab] = useState<'mine' | 'pool'>('mine');
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState<number | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
    const [shopId, setShopId] = useState<number | null>(null);
    const [careLogNote, setCareLogNote] = useState('');
    const [careLogType, setCareLogType] = useState('FEEDING');
    const [submittingLog, setSubmittingLog] = useState(false);

    // Mock logs for UI demo
    const [mockLogs, setMockLogs] = useState([
        { id: 1, type: 'FEEDING', note: 'Đã cho bé ăn hạt và pate.', time: '08:30', staff: 'Bác sĩ Sang' },
        { id: 2, type: 'CLEANING', note: 'Dọn vệ sinh chuồng sạch sẽ.', time: '09:00', staff: 'Bác sĩ Sang' },
    ]);

    const handleAddCareLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!careLogNote.trim()) return;
        
        setSubmittingLog(true);
        // Simulate API call
        setTimeout(() => {
            const newLog = {
                id: Date.now(),
                type: careLogType,
                note: careLogNote,
                time: format(new Date(), 'HH:mm'),
                staff: user?.fullName || 'Staff'
            };
            setMockLogs(prev => [newLog, ...prev]);
            setCareLogNote('');
            setSubmittingLog(false);
            toast.success('Đã cập nhật nhật ký chăm sóc!');
        }, 800);
    };

    const CARE_LOG_TYPES = [
        { id: 'FEEDING', label: 'Cho ăn', icon: Heart, color: 'text-orange-500 bg-orange-50' },
        { id: 'CLEANING', label: 'Vệ sinh', icon: Star, color: 'text-blue-500 bg-blue-50' },
        { id: 'MEDICAL', label: 'Y tế', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50' },
        { id: 'EXERCISE', label: 'Vui chơi', icon: Zap, color: 'text-purple-500 bg-purple-50' },
    ];

    const loadData = async () => {
        setLoading(true);
        try {
            const [mine, pool, profile] = await Promise.all([
                taskService.getMyTasks(),
                taskService.getUnassignedTasks().catch(() => []),
                staffService.getMyProfile().catch(() => null)
            ]);
            setMyTasks(mine);
            setPoolTasks(pool);
            if (profile) setShopId(profile.shopId);
        } catch { 
            toast.error('Không thể kết nối máy chủ'); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleUpdateStatus = async (bookingId: number, nextStatus: TaskStatus) => {
        setUpdating(bookingId);
        try {
            const updated = await taskService.updateStatus(bookingId, nextStatus);
            setMyTasks(prev => prev.map(t => t.bookingId === bookingId ? updated : t));
            toast.success(`Đã cập nhật trạng thái: ${STATUS_CONFIG[updated.status]?.label}`);
            if (selectedTask?.bookingId === bookingId) setSelectedTask(updated);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Thao tác thất bại');
        } finally { 
            setUpdating(null); 
        }
    };

    const handleClaimTask = async (bookingId: number) => {
        setUpdating(bookingId);
        try {
            const claimed = await taskService.claimTask(bookingId);
            setPoolTasks(prev => prev.filter(t => t.bookingId !== bookingId));
            setMyTasks(prev => [claimed, ...prev]);
            toast.success('Đã nhận công việc thành công!');
            setActiveTab('mine');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Không thể nhận task');
        } finally { 
            setUpdating(null); 
        }
    };

    // Filters
    const inProgressTasks = myTasks.filter(t => t.status === 'IN_PROGRESS');
    const pendingTasks = myTasks.filter(t => t.status === 'CONFIRMED');
    const completedTasks = myTasks.filter(t => ['COMPLETED', 'CANCELLED'].includes(t.status));

    /* ─── SUB-COMPONENTS ────────────────────────────────────────────── */

    const TaskCard = ({ task, isPool = false }: { task: TaskResponse; isPool?: boolean }) => {
        const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.CONFIRMED;
        const next = NEXT_STATUS[task.status];
        const busy = updating === task.bookingId;
        const StatusIcon = cfg.icon;

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => !isPool && setSelectedTask(task)}
                className={`group relative bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden`}
            >
                {/* Visual Accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${cfg.gradient} opacity-[0.03] rounded-bl-full`} />

                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-2xl shadow-inner">
                            🐾
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-primary transition-colors">{task.petName}</h3>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                <User size={12} /> {task.customerName}
                            </p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${cfg.color}`}>
                        <StatusIcon size={12} className={task.status === 'IN_PROGRESS' ? 'animate-pulse' : ''} />
                        {cfg.label}
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100/50 dark:border-slate-700">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm">
                            <ClipboardList size={14} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{task.serviceName}</span>
                    </div>
                    <div className="flex items-center gap-4 px-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Clock size={14} className="text-indigo-400" />
                            {formatTime(task.appointmentDatetime)}
                        </div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Calendar size={14} className="text-indigo-400" />
                            {formatDate(task.appointmentDatetime)}
                        </div>
                    </div>
                </div>

                {task.note && (
                    <div className="mb-6 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Info size={10} /> Ghi chú
                        </p>
                        <p className="text-[11px] text-amber-800 dark:text-amber-200 font-medium leading-relaxed italic">
                            "{task.note}"
                        </p>
                    </div>
                )}

                {!isPool ? (
                    next && (
                        <button
                            disabled={busy}
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(task.bookingId, next); }}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${cfg.shadow} ${
                                next === 'IN_PROGRESS' 
                                ? 'bg-primary text-white hover:bg-primary-dark' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            } disabled:opacity-50`}
                        >
                            {busy ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                            {busy ? 'Đang cập nhật...' : NEXT_LABEL[task.status]}
                        </button>
                    )
                ) : (
                    <button
                        disabled={busy}
                        onClick={(e) => { e.stopPropagation(); handleClaimTask(task.bookingId); }}
                        className="w-full py-4 rounded-2xl bg-[#1a2b4c] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-dark shadow-xl shadow-indigo-900/10 transition-all disabled:opacity-50"
                    >
                        {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        {busy ? 'Đang nhận...' : 'Nhận ca trực này'}
                    </button>
                )}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-background-dark pb-24">
            {/* Header / Top Bar */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">
                            {user?.fullName?.charAt(0) || 'S'}
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">PetEye Staff</h1>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1 uppercase tracking-widest">
                                <ShieldCheck size={10} className="text-emerald-500" /> Nhân viên chuyên môn
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl hover:text-primary transition-all relative">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
                        </button>
                        <button 
                            onClick={loadData}
                            disabled={loading}
                            className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl hover:text-primary transition-all"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 pt-8">
                {/* Welcome & Stats */}
                <section className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Xin chào, {user?.fullName || 'Bác sĩ'}! 👋</h2>
                            <p className="text-slate-500 font-medium mt-2">Bạn có <span className="text-primary font-black underline decoration-primary/20 underline-offset-4">{myTasks.filter(t => t.status !== 'COMPLETED').length} công việc</span> cần xử lý hôm nay.</p>
                        </div>
                        
                        <div className="flex gap-3">
                            {[
                                { label: 'Đang làm', count: inProgressTasks.length, color: 'bg-blue-600', shadow: 'shadow-blue-200' },
                                { label: 'Chờ làm', count: pendingTasks.length, color: 'bg-amber-500', shadow: 'shadow-amber-200' },
                                { label: 'Xong', count: completedTasks.length, color: 'bg-emerald-600', shadow: 'shadow-emerald-200' },
                            ].map(s => (
                                <div key={s.label} className="bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${s.color} text-white flex items-center justify-center font-black text-xs shadow-lg ${s.shadow}`}>
                                        {s.count}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Main Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-3xl mb-8 w-fit shadow-inner">
                    <button 
                        onClick={() => setActiveTab('mine')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'mine' ? 'bg-white dark:bg-slate-800 text-primary shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <User size={14} /> Công việc của tôi
                        {myTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length > 0 && <span className="ml-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px]">{myTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length}</span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('pool')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'pool' ? 'bg-white dark:bg-slate-800 text-primary shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid size={14} /> Kho chung
                        {poolTasks.length > 0 && <span className="ml-1 bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[10px]">{poolTasks.length}</span>}
                    </button>
                </div>

                {/* Content Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-24 gap-4"
                        >
                            <Loader2 size={48} className="animate-spin text-primary opacity-20" />
                            <p className="font-bold text-slate-400 animate-pulse tracking-widest text-xs uppercase">Đang đồng bộ dữ liệu...</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            {activeTab === 'mine' ? (
                                <>
                                    {/* In Progress Section */}
                                    {inProgressTasks.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Đang thực hiện</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {inProgressTasks.map(t => <TaskCard key={t.bookingId} task={t} />)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Pending Section */}
                                    {pendingTasks.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Chờ thực hiện</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {pendingTasks.map(t => <TaskCard key={t.bookingId} task={t} />)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty State for Mine */}
                                    {myTasks.length === 0 && (
                                        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-16 text-center border border-dashed border-slate-200 dark:border-slate-700">
                                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                                                <Heart size={40} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Hôm nay chưa có lịch</h3>
                                            <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">Bạn có thể kiểm tra "Kho chung" để nhận thêm các ca trực mới từ cửa hàng.</p>
                                        </div>
                                    )}

                                    {/* History Button (Small link) */}
                                    {completedTasks.length > 0 && (
                                        <div className="pt-8 flex justify-center">
                                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                                                Xem {completedTasks.length} ca trực đã hoàn thành <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Pool Tasks */}
                                    {poolTasks.length > 0 ? (
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Kho công việc chung</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {poolTasks.map(t => <TaskCard key={t.bookingId} task={t} isPool />)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-16 text-center border border-dashed border-slate-200 dark:border-slate-700">
                                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                                                <Zap size={40} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Kho chung đang trống</h3>
                                            <p className="text-slate-500 font-medium mt-2">Hiện tại không có ca trực nào cần người nhận. Hãy quay lại sau nhé!</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Quick Actions Floating Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-primary/90 dark:bg-primary/80 backdrop-blur-xl p-2 rounded-3xl shadow-2xl border border-white/10 z-50">
                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-primary font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                    <Camera size={16} /> Báo cáo
                </button>
                <div className="w-px h-6 bg-white/20 mx-1" />
                <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('toggle-chat'))}
                    className="p-3 text-white hover:bg-white/10 rounded-2xl transition-all" title="Tin nhắn"
                >
                    <MessageCircle size={20} />
                    {/* Potential badge for unread messages could go here */}
                </button>
                <button className="p-3 text-white hover:bg-white/10 rounded-2xl transition-all" title="Lịch của tôi">
                    <Calendar size={20} />
                </button>
            </div>

            {/* Task Detail Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedTask(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                        >
                            <button 
                                onClick={() => setSelectedTask(null)}
                                className="absolute top-6 right-6 p-2.5 bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-500 hover:rotate-90 transition-all z-10"
                            >
                                <X size={20} />
                            </button>

                            {/* Modal Left: Pet Identity */}
                            <div className="md:w-5/12 bg-slate-50 dark:bg-slate-900/50 p-10 flex flex-col items-center text-center">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center text-5xl mb-8 border-4 border-white dark:border-slate-800 transform -rotate-3">
                                    🐾
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{selectedTask.petName}</h2>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-8 ${STATUS_CONFIG[selectedTask.status]?.color}`}>
                                    {STATUS_CONFIG[selectedTask.status]?.label}
                                </div>

                                <div className="w-full space-y-4 pt-8 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-primary">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedTask.customerName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-primary">
                                            <Info size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dịch vụ</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedTask.serviceName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Right: Task Content & Actions */}
                            <div className="flex-1 p-10 overflow-y-auto">
                                <div className="flex items-center gap-2 mb-8">
                                    <Zap size={20} className="text-primary" />
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Quy trình chăm sóc</h3>
                                </div>
                                
                                <div className="space-y-10">
                                    {/* Task Status Progress */}
                                    <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dịch vụ</p>
                                            <p className="text-sm font-black text-primary">{selectedTask.serviceName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Giờ hẹn</p>
                                            <p className="text-sm font-black text-slate-700 dark:text-white">{formatTime(selectedTask.appointmentDatetime)}</p>
                                        </div>
                                    </div>

                                    {/* Care Logs Section */}
                                    {selectedTask.status === 'IN_PROGRESS' && (
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Plus size={14} className="text-primary" /> Cập nhật nhật ký mới
                                            </p>
                                            <form onSubmit={handleAddCareLog} className="space-y-4">
                                                <div className="flex gap-2">
                                                    {CARE_LOG_TYPES.map(type => (
                                                        <button
                                                            key={type.id}
                                                            type="button"
                                                            onClick={() => setCareLogType(type.id)}
                                                            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                                                                careLogType === type.id 
                                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/30'
                                                            }`}
                                                        >
                                                            <type.icon size={16} />
                                                            <span className="text-[9px] font-black uppercase tracking-tighter">{type.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="relative">
                                                    <textarea 
                                                        value={careLogNote}
                                                        onChange={(e) => setCareLogNote(e.target.value)}
                                                        placeholder="Nhập nội dung hoạt động chăm sóc..."
                                                        className="w-full p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
                                                    />
                                                    <button 
                                                        type="submit"
                                                        disabled={submittingLog || !careLogNote.trim()}
                                                        className="absolute bottom-4 right-4 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                                    >
                                                        {submittingLog ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <List size={14} className="text-primary" /> Nhật ký hoạt động
                                        </p>
                                        <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-700">
                                            {mockLogs.map((log) => {
                                                const typeCfg = CARE_LOG_TYPES.find(t => t.id === log.type) || CARE_LOG_TYPES[0];
                                                return (
                                                    <div key={log.id} className="relative pl-10">
                                                        <div className={`absolute left-0 w-8 h-8 rounded-xl ${typeCfg.color} flex items-center justify-center z-10 shadow-sm border-4 border-white dark:border-slate-800`}>
                                                            <typeCfg.icon size={12} />
                                                        </div>
                                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{typeCfg.label}</span>
                                                                <span className="text-[10px] font-bold text-slate-400">{log.time}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{log.note}</p>
                                                            <p className="text-[9px] text-slate-400 mt-2 font-bold italic">Thực hiện bởi: {log.staff}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Main Actions */}
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-3">
                                        {NEXT_STATUS[selectedTask.status] && (
                                            <button 
                                                disabled={updating === selectedTask.bookingId}
                                                onClick={() => handleUpdateStatus(selectedTask.bookingId, NEXT_STATUS[selectedTask.status]!)}
                                                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                                            >
                                                {updating === selectedTask.bookingId ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                                                {updating === selectedTask.bookingId ? 'Đang xử lý...' : NEXT_LABEL[selectedTask.status]}
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setSelectedTask(null)}
                                            className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                        >
                                            Đóng chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
