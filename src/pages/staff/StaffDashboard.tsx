import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList, CheckCircle2, Clock, PlayCircle,
    ChevronRight, Loader2, RefreshCw, XCircle, Bell, Camera, 
    MessageCircle, Calendar, User, Zap, Star, ShieldCheck, 
    ArrowUpRight, Info, CheckCircle, Heart, Plus, Search,
    MoreVertical, ChevronLeft, LayoutGrid, List, SlidersHorizontal,
    X, Send, ImageIcon, Video, MapPin, Sparkles, AlertCircle,
    ArrowRight, TrendingUp, Filter
} from 'lucide-react';
import { taskService, type TaskResponse, type TaskStatus } from '../../services/task.service';
import { careLogService, type CareLogResponse } from '../../services/care-log.service';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

/* ─── CONFIG & HELPERS ────────────────────────────────────────────────── */

const STATUS_CONFIG = {
    CONFIRMED: { 
        label: 'Chờ thực hiện', 
        color: 'text-amber-600 bg-amber-50 border-amber-100',
        icon: Clock,
        gradient: 'from-amber-500 to-orange-400',
        shadow: 'shadow-amber-200/40',
        bg: 'bg-amber-500'
    },
    IN_PROGRESS: { 
        label: 'Đang thực hiện', 
        color: 'text-blue-600 bg-blue-50 border-blue-100',
        icon: Zap,
        gradient: 'from-blue-600 to-indigo-500',
        shadow: 'shadow-blue-200/40',
        bg: 'bg-blue-600'
    },
    COMPLETED: { 
        label: 'Hoàn thành', 
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        icon: CheckCircle2,
        gradient: 'from-emerald-600 to-teal-500',
        shadow: 'shadow-emerald-200/40',
        bg: 'bg-emerald-600'
    },
    CANCELLED: { 
        label: 'Đã hủy', 
        color: 'text-rose-600 bg-rose-50 border-rose-100',
        icon: XCircle,
        gradient: 'from-rose-600 to-pink-500',
        shadow: 'shadow-rose-200/40',
        bg: 'bg-rose-600'
    },
    PENDING_PAYMENT: { 
        label: 'Chờ thanh toán', 
        color: 'text-slate-600 bg-slate-50 border-slate-100',
        icon: Clock,
        gradient: 'from-slate-600 to-slate-400',
        shadow: 'shadow-slate-200/40',
        bg: 'bg-slate-600'
    },
} as const;

const NEXT_STATUS: Record<string, TaskStatus | null> = {
    CONFIRMED: 'IN_PROGRESS', 
    IN_PROGRESS: 'COMPLETED', 
    COMPLETED: null, 
    WAITING_REFUND: null,
    CANCELLED: null, 
    PENDING_PAYMENT: null,
};

const NEXT_LABEL: Record<string, string> = { 
    CONFIRMED: 'Bắt đầu làm', 
    IN_PROGRESS: 'Hoàn thành ngay' 
};

const CARE_LOG_TYPES = [
    { id: 'FEEDING', label: 'Cho ăn', icon: Heart, color: 'text-orange-500 bg-orange-50' },
    { id: 'CLEANING', label: 'Vệ sinh', icon: Star, color: 'text-blue-500 bg-blue-50' },
    { id: 'MEDICAL', label: 'Y tế', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50' },
    { id: 'EXERCISE', label: 'Vui chơi', icon: Zap, color: 'text-purple-500 bg-purple-50' },
];

const formatTime = (iso: string) => format(parseISO(iso), 'HH:mm', { locale: vi });
const formatDate = (iso: string) => format(parseISO(iso), 'dd/MM/yyyy', { locale: vi });

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────── */

export default function StaffDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [myTasks, setMyTasks] = useState<TaskResponse[]>([]);
    const [poolTasks, setPoolTasks] = useState<TaskResponse[]>([]);
    const [activeTab, setActiveTab] = useState<'mine' | 'pool'>('mine');
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState<number | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
    const [careLogs, setCareLogs] = useState<CareLogResponse[]>([]);
    const [careLogNote, setCareLogNote] = useState('');
    const [careLogType, setCareLogType] = useState('FEEDING');
    const [submittingLog, setSubmittingLog] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [mine, pool] = await Promise.all([
                taskService.getMyTasks(),
                taskService.getUnassignedTasks().catch(() => []),
            ]);
            setMyTasks(mine);
            setPoolTasks(pool);
        } catch { 
            toast.error('Không thể kết nối máy chủ'); 
        } finally { 
            setLoading(false); 
        }
    };

    const fetchLogs = async (bookingId: number) => {
        try {
            const logs = await careLogService.getLogs(bookingId);
            setCareLogs(logs);
        } catch {
            console.error('Failed to fetch logs');
        }
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        if (selectedTask) {
            fetchLogs(selectedTask.bookingId);
        }
    }, [selectedTask]);

    const handleUpdateStatus = async (bookingId: number, nextStatus: TaskStatus) => {
        setUpdating(bookingId);
        try {
            const updated = await taskService.updateStatus(bookingId, nextStatus);
            setMyTasks(prev => prev.map(t => t.bookingId === bookingId ? updated : t));
            toast.success(`Đã cập nhật: ${STATUS_CONFIG[updated.status]?.label}`);
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

    const handleAddCareLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!careLogNote.trim() || !selectedTask) return;
        
        setSubmittingLog(true);
        try {
            const newLog = await careLogService.addLog(selectedTask.bookingId, {
                type: careLogType,
                note: careLogNote
            });
            setCareLogs(prev => [newLog, ...prev]);
            setCareLogNote('');
            toast.success('Đã lưu nhật ký chăm sóc!');
        } catch {
            toast.error('Không thể lưu nhật ký');
        } finally {
            setSubmittingLog(false);
        }
    };

    const inProgressTasks = myTasks.filter(t => t.status === 'IN_PROGRESS');
    const pendingTasks = myTasks.filter(t => t.status === 'CONFIRMED');

    /* ─── SUB-COMPONENTS ────────────────────────────────────────────── */

    const TaskCard = ({ task, isPool = false }: { task: TaskResponse; isPool?: boolean }) => {
        const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.CONFIRMED;
        const next = NEXT_STATUS[task.status];
        const busy = updating === task.bookingId;
        const StatusIcon = cfg.icon;

        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                onClick={() => !isPool && setSelectedTask(task)}
                className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_-12px_rgba(18,33,67,0.15)] transition-all duration-500 cursor-pointer overflow-hidden"
            >
                {/* Visual Glow */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${cfg.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />

                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-4xl shadow-inner border border-slate-100 dark:border-slate-700 transition-transform duration-500 group-hover:scale-110">
                                🐾
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center border border-slate-50 dark:border-slate-700">
                                <Sparkles size={14} className="text-amber-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight leading-tight group-hover:text-primary transition-colors">
                                {task.petName}
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1.5 bg-slate-50 dark:bg-slate-900/50 w-fit px-2 py-0.5 rounded-lg">
                                <User size={12} className="text-primary" /> {task.customerName}
                            </div>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border ${cfg.color} shadow-sm backdrop-blur-sm`}>
                        <StatusIcon size={12} className={task.status === 'IN_PROGRESS' ? 'animate-pulse' : ''} />
                        {cfg.label}
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[1.8rem] border border-slate-100/50 dark:border-slate-700 group-hover:bg-primary/5 group-hover:border-primary/10 transition-all duration-500">
                        <div className="flex items-center gap-4 mb-1">
                             <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm border border-slate-100 dark:border-slate-700">
                                <ClipboardList size={18} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dịch vụ</p>
                        </div>
                        <span className="text-base font-black text-slate-800 dark:text-slate-200 ml-1">{task.serviceName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100/50 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2.5">
                            <Clock size={16} className="text-indigo-500" />
                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">{formatTime(task.appointmentDatetime)}</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                        <div className="flex items-center gap-2.5">
                            <Calendar size={16} className="text-rose-500" />
                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">{formatDate(task.appointmentDatetime)}</span>
                        </div>
                    </div>
                </div>

                {!isPool ? (
                    next && (
                        <button
                            disabled={busy}
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(task.bookingId, next); }}
                            className={`w-full py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl ${cfg.shadow} ${
                                next === 'IN_PROGRESS' 
                                ? 'bg-primary text-white hover:bg-primary-dark' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            } disabled:opacity-50`}
                        >
                            {busy ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
                            {busy ? 'Đang xử lý...' : NEXT_LABEL[task.status]}
                        </button>
                    )
                ) : (
                    <button
                        disabled={busy}
                        onClick={(e) => { e.stopPropagation(); handleClaimTask(task.bookingId); }}
                        className="w-full py-4 rounded-[1.5rem] bg-[#1a2b4c] text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary-dark shadow-xl shadow-indigo-900/20 transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {busy ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        {busy ? 'Đang nhận...' : 'Nhận ca trực này'}
                    </button>
                )}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-[#fcfdfe] dark:bg-background-dark pb-20">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 lg:pt-16">
                
                {/* HERO SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-7"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-1 bg-primary rounded-full shrink-0" />
                            <p className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em] sm:tracking-[0.3em] truncate">Hệ thống quản lý chuyên sâu</p>
                        </div>
                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2] lg:leading-[1.1] mb-6">
                            Chào buổi sáng, <br />
                            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                                {user?.fullName || 'Bác sĩ'}! ✨
                            </span>
                        </h2>
                        <p className="text-slate-500 font-medium text-lg lg:max-w-lg leading-relaxed">
                            Dưới đây là tổng quan công việc của bạn hôm nay. Hãy bắt đầu với tinh thần tốt nhất nhé!
                        </p>
                        
                        <div className="hidden lg:flex items-center gap-4 mt-10">
                            <button className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
                                <Camera size={18} /> Báo cáo nhanh
                            </button>
                            <button 
                                onClick={loadData}
                                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Làm mới dữ liệu
                            </button>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4"
                    >
                        {[
                            { label: 'Đang làm', count: inProgressTasks.length, color: 'bg-blue-600', icon: Zap, gradient: 'from-blue-600/10 to-transparent' },
                            { label: 'Chờ xử lý', count: pendingTasks.length, color: 'bg-amber-500', icon: Clock, gradient: 'from-amber-500/10 to-transparent' },
                            { label: 'Hoàn thành', count: myTasks.filter(t => t.status === 'COMPLETED').length, color: 'bg-emerald-600', icon: CheckCircle2, gradient: 'from-emerald-600/10 to-transparent' },
                            { label: 'Hiệu suất', count: '98%', color: 'bg-purple-600', icon: TrendingUp, gradient: 'from-purple-600/10 to-transparent' },
                        ].map((s, idx) => (
                            <div key={idx} className={`relative group bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-[1.8rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden`}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                <div className={`w-10 h-10 rounded-xl ${s.color} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <s.icon size={20} />
                                </div>
                                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-2">{s.count}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* TABS & FILTER BAR */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-sm">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[2rem] w-full md:w-fit shadow-inner">
                        <button 
                            onClick={() => setActiveTab('mine')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-4 sm:px-8 py-3.5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'mine' ? 'bg-white dark:bg-slate-700 text-primary shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <User size={16} /> Cá nhân
                            {myTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.status !== 'WAITING_REFUND').length > 0 && 
                                <span className="ml-1 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px]">
                                    {myTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.status !== 'WAITING_REFUND').length}
                                </span>
                            }
                        </button>
                        <button 
                            onClick={() => setActiveTab('pool')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-4 sm:px-8 py-3.5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'pool' ? 'bg-white dark:bg-slate-700 text-primary shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={16} /> Kho chung
                            {poolTasks.length > 0 && 
                                <span className="ml-1 bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px]">
                                    {poolTasks.length}
                                </span>
                            }
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto px-4">
                        <div className="flex-1 md:w-64 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm ca trực..."
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            />
                        </div>
                        <button className="p-3 bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 rounded-2xl hover:text-primary transition-all shadow-sm">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {/* CONTENT GRID */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-40 gap-8"
                        >
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap className="text-primary animate-pulse" size={32} />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-black text-slate-900 dark:text-white tracking-[0.3em] text-xs uppercase mb-2">Đang xử lý dữ liệu</p>
                                <p className="text-slate-400 text-[10px] font-bold italic">Vui lòng đợi trong giây lát...</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className="space-y-20"
                        >
                            {activeTab === 'mine' ? (
                                <>
                                    {/* Section Group 1 */}
                                    {inProgressTasks.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-5 mb-10">
                                                <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-lg shadow-blue-200" />
                                                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Đang thực hiện</h3>
                                                <span className="px-4 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase rounded-xl border border-blue-100 dark:border-blue-800">
                                                    {inProgressTasks.length} Task
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                                                {inProgressTasks.map(t => <TaskCard key={t.bookingId} task={t} />)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Section Group 2 */}
                                    <div>
                                        <div className="flex items-center gap-5 mb-10">
                                            <div className="w-1.5 h-8 bg-amber-500 rounded-full shadow-lg shadow-amber-200" />
                                            <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Việc chờ xử lý</h3>
                                            <span className="px-4 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase rounded-xl border border-amber-100 dark:border-amber-800">
                                                {pendingTasks.length} Task
                                            </span>
                                        </div>
                                        {pendingTasks.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                                                {pendingTasks.map(t => <TaskCard key={t.bookingId} task={t} />)}
                                            </div>
                                        ) : (
                                            <div className="bg-white dark:bg-slate-800/40 rounded-[3.5rem] p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
                                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
                                                    <Clock size={40} />
                                                </div>
                                                <h4 className="text-xl font-black text-slate-400">Danh sách chờ đang trống</h4>
                                                <p className="text-slate-400 text-sm mt-2">Bạn có thể dành thời gian này để chuẩn bị dụng cụ!</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Empty State for Mine */}
                                    {myTasks.length === 0 && (
                                        <div className="bg-white dark:bg-slate-800 rounded-[4rem] p-24 text-center border border-slate-100 dark:border-slate-700 shadow-xl relative overflow-hidden">
                                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-slate-200 shadow-inner">
                                                <Heart size={48} />
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Hôm nay bạn chưa có lịch</h3>
                                            <p className="text-slate-500 font-medium max-w-sm mx-auto text-lg leading-relaxed mb-10">
                                                Hãy kiểm tra kho chung để nhận thêm các ca trực mới từ cửa hàng.
                                            </p>
                                            <button 
                                                onClick={() => setActiveTab('pool')}
                                                className="px-12 py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30"
                                            >
                                                Tới Kho chung <ArrowRight size={18} className="inline ml-2" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Pool Tasks */}
                                    <div className="flex items-center gap-5 mb-10">
                                        <div className="w-1.5 h-8 bg-purple-600 rounded-full shadow-lg shadow-purple-200" />
                                        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Việc cần hỗ trợ</h3>
                                        <span className="px-4 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase rounded-xl border border-purple-100 dark:border-purple-800">
                                            {poolTasks.length} Mới
                                        </span>
                                    </div>
                                    {poolTasks.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                                            {poolTasks.map(t => <TaskCard key={t.bookingId} task={t} isPool />)}
                                        </div>
                                    ) : (
                                        <div className="bg-white dark:bg-slate-800 rounded-[4rem] p-24 text-center border border-slate-100 dark:border-slate-700 shadow-xl">
                                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-slate-200 shadow-inner">
                                                <Zap size={48} />
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Kho chung đang trống</h3>
                                            <p className="text-slate-500 font-medium text-lg lg:max-w-md mx-auto">Mọi công việc đã được xử lý xong. Hãy tận hưởng thời gian nghỉ ngơi!</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* QUICK ACTIONS - Mobile Only Floating Button */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-full max-w-[340px] px-4">
                 <div className="bg-slate-900/95 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] border border-white/10 flex items-center justify-between">
                    <button className="flex items-center gap-3 px-6 py-4 rounded-[2rem] bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        <Camera size={18} /> Báo cáo
                    </button>
                    <div className="flex gap-2 pr-2">
                        <button 
                            onClick={loadData}
                            className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-2xl transition-all"
                        >
                            <RefreshCw size={22} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* TASK DETAIL MODAL - Optimized Structure */}
            <AnimatePresence>
                {selectedTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 md:p-8 lg:p-12 overflow-hidden">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedTask(null)}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 100 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 100 }}
                            className="relative w-full max-w-6xl h-full sm:h-auto sm:max-h-[90vh] bg-white dark:bg-slate-900 rounded-none sm:rounded-[4rem] shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Modal Header (Mobile Sticky) */}
                            <div className="sticky top-0 z-[40] flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Chi tiết Ca trực</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Mã số: #{selectedTask.bookingId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => navigate('/staff/tasks', { state: { taskId: selectedTask.bookingId } })}
                                        className="px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-dark rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hidden sm:flex items-center gap-2"
                                    >
                                        Vào không gian làm việc
                                    </button>
                                    <button 
                                        onClick={() => setSelectedTask(null)}
                                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-rose-500 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                <div className="flex flex-col lg:flex-row h-full">
                                    
                                    {/* Left Panel: Pet Identity */}
                                    <div className="lg:w-[35%] p-8 sm:p-10 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-36 h-36 rounded-[3rem] bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-6xl mb-6 border-8 border-white dark:border-slate-800 relative">
                                                🐾
                                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-slate-900">
                                                    <Sparkles size={18} />
                                                </div>
                                            </div>
                                            <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{selectedTask.petName}</h4>
                                            <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-8 shadow-sm ${STATUS_CONFIG[selectedTask.status]?.color}`}>
                                                {STATUS_CONFIG[selectedTask.status]?.label}
                                            </div>

                                            <div className="w-full space-y-4">
                                                {[
                                                    { label: 'Chủ nuôi', value: selectedTask.customerName, icon: User, color: 'text-primary bg-primary/5' },
                                                    { label: 'Dịch vụ', value: selectedTask.serviceName, icon: ClipboardList, color: 'text-amber-600 bg-amber-50' },
                                                    { label: 'Lịch hẹn', value: `${formatTime(selectedTask.appointmentDatetime)} - ${formatDate(selectedTask.appointmentDatetime)}`, icon: Clock, color: 'text-indigo-600 bg-indigo-50' }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-left">
                                                        <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                                                            <item.icon size={20} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                                            <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">{item.value}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {selectedTask.note && (
                                                <div className="w-full mt-6 p-6 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-3xl text-left">
                                                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                        <AlertCircle size={14} /> Ghi chú đặc biệt
                                                    </p>
                                                    <p className="text-xs text-amber-900 dark:text-amber-200 font-bold leading-relaxed italic line-clamp-3 hover:line-clamp-none transition-all">
                                                        "{selectedTask.note}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Panel: Operations & Logs */}
                                    <div className="flex-1 p-8 sm:p-10 lg:p-12">
                                        
                                        {/* Activity Logging Section */}
                                        {selectedTask.status === 'IN_PROGRESS' ? (
                                            <div className="mb-12">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <Plus size={18} className="text-primary" />
                                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Ghi nhận hoạt động mới</p>
                                                </div>
                                                <form onSubmit={handleAddCareLog} className="space-y-6">
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {CARE_LOG_TYPES.map(type => (
                                                            <button
                                                                key={type.id}
                                                                type="button"
                                                                onClick={() => setCareLogType(type.id)}
                                                                className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-300 ${
                                                                    careLogType === type.id 
                                                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 -translate-y-1' 
                                                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/20'
                                                                }`}
                                                            >
                                                                <type.icon size={18} />
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-center">{type.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="relative">
                                                        <textarea 
                                                            value={careLogNote}
                                                            onChange={(e) => setCareLogNote(e.target.value)}
                                                            placeholder="Mô tả nội dung chăm sóc..."
                                                            className="w-full p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-3xl text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all min-h-[120px] resize-none"
                                                        />
                                                        <button 
                                                            type="submit"
                                                            disabled={submittingLog || !careLogNote.trim()}
                                                            className="absolute bottom-4 right-4 p-3.5 bg-primary text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                                        >
                                                            {submittingLog ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                                        </button>
                                                    </div>
                                                </form>
                                                
                                                <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                                                    <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Cần ghi nhận Hồ sơ y tế?</h4>
                                                    <p className="text-xs text-slate-500 mb-6">Để thêm hồ sơ y tế cho dịch vụ phòng khám, vui lòng chuyển đến Không gian làm việc.</p>
                                                    <button 
                                                        onClick={() => navigate('/staff/tasks', { state: { taskId: selectedTask.bookingId } })}
                                                        className="px-6 py-3 bg-white border border-slate-200 text-primary rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:scale-105 active:scale-95 transition-transform"
                                                    >
                                                        ĐI TỚI KHÔNG GIAN LÀM VIỆC
                                                    </button>
                                                </div>
                                            </div>
                                        ) : selectedTask.status === 'CONFIRMED' ? (
                                            <div className="mb-12 bg-primary/5 p-10 rounded-[3rem] border border-primary/10 flex flex-col items-center text-center">
                                                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
                                                    <PlayCircle size={32} />
                                                </div>
                                                <h5 className="text-xl font-black text-primary mb-2">Bắt đầu thực hiện?</h5>
                                                <p className="text-slate-500 text-sm mb-8">Kích hoạt ca trực để bắt đầu ghi lại quá trình chăm sóc.</p>
                                                <button 
                                                    onClick={() => handleUpdateStatus(selectedTask.bookingId, 'IN_PROGRESS')}
                                                    className="px-10 py-4 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                                                >
                                                    Bắt đầu ngay
                                                </button>
                                            </div>
                                        ) : null}

                                        {/* History Section */}
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <List size={20} className="text-primary" />
                                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Lịch sử Chăm sóc</p>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase">{careLogs.length} Ghi nhận</span>
                                            </div>

                                            <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-1 before:bg-slate-100 dark:before:bg-slate-800">
                                                {careLogs.length > 0 ? (
                                                    careLogs.map((log, idx) => {
                                                        const typeCfg = CARE_LOG_TYPES.find(t => t.id === log.type) || CARE_LOG_TYPES[0];
                                                        return (
                                                            <motion.div 
                                                                key={log.id} 
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                className="relative pl-12"
                                                            >
                                                                <div className={`absolute left-0 w-10 h-10 rounded-xl ${typeCfg.color} flex items-center justify-center z-10 shadow-sm border-4 border-white dark:border-slate-900`}>
                                                                    <typeCfg.icon size={16} />
                                                                </div>
                                                                <div className="bg-white dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                                    <div className="flex justify-between items-center mb-1.5">
                                                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{typeCfg.label}</span>
                                                                        <span className="text-[9px] font-bold text-slate-400">{format(parseISO(log.timestamp), 'HH:mm')}</span>
                                                                    </div>
                                                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{log.note}</p>
                                                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                                                                        <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                                                            {log.staffName.charAt(0)}
                                                                        </div>
                                                                        <p className="text-[9px] text-slate-400 font-bold italic">Bởi: {log.staffName}</p>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="pl-12 py-10 text-center lg:text-left">
                                                        <p className="text-slate-400 font-bold italic text-sm">Chưa có nhật ký hoạt động cho ca trực này.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer (Always Visible) */}
                            <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
                                    {NEXT_STATUS[selectedTask.status] && (
                                        <button 
                                            disabled={updating === selectedTask.bookingId}
                                            onClick={() => handleUpdateStatus(selectedTask.bookingId, NEXT_STATUS[selectedTask.status]!)}
                                            className="flex-[2] py-4.5 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3"
                                        >
                                            {updating === selectedTask.bookingId ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                            {updating === selectedTask.bookingId ? 'Đang cập nhật...' : NEXT_LABEL[selectedTask.status]}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setSelectedTask(null)}
                                        className="flex-1 py-4.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Quay lại Dashboard
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
