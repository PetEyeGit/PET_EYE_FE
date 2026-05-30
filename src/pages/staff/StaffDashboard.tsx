import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Clock, CheckCircle2, Search, Filter, Camera, Zap, Heart, User, Plus, LayoutGrid, X,
    Activity, Syringe, Utensils, Loader2, Sparkles, ClipboardList, AlertCircle, Calendar, Play, Save
} from 'lucide-react';
import { taskService, type TaskResponse, type TaskStatus } from '../../services/task.service';
import { careLogService, type CareLogResponse } from '../../services/care-log.service';
import { petMedicalService, type PetMedicalRecordRequest } from '../../services/pet-medical.service';
import { fileService } from '../../services/file.service';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/booking.service';
import type { BookingResponse } from '../../types/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

// Constants
const STATUS_CONFIG = {
    CONFIRMED: { label: 'Chờ xử lý', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock },
    IN_PROGRESS: { label: 'Đang làm', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Zap },
    COMPLETED: { label: 'Hoàn thành', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
    CANCELLED: { label: 'Đã hủy', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: X },
    PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'text-slate-600 bg-slate-50 border-slate-100', icon: Clock },
    WAITING_REFUND: { label: 'Chờ hoàn tiền', color: 'text-slate-600 bg-slate-50 border-slate-100', icon: Clock },
} as const;

const CARE_LOG_TYPES = [
    { id: 'FEEDING', label: 'Cho ăn', icon: Utensils, color: 'text-orange-500 bg-orange-50' },
    { id: 'CLEANING', label: 'Vệ sinh', icon: Activity, color: 'text-blue-500 bg-blue-50' },
    { id: 'MEDICAL', label: 'Y tế', icon: Syringe, color: 'text-emerald-500 bg-emerald-50' },
    { id: 'EXERCISE', label: 'Vui chơi', icon: Heart, color: 'text-purple-500 bg-purple-50' },
];

const guessCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('lưu trú') || n.includes('boarding') || n.includes('trông')) return 'BOARDING';
    if (n.includes('spa') || n.includes('tắm') || n.includes('cắt') || n.includes('grooming')) return 'GROOMING';
    return 'CLINIC';
};

const formatTime = (iso: string) => format(parseISO(iso), 'HH:mm', { locale: vi });
const formatDate = (iso: string) => format(parseISO(iso), 'dd/MM/yyyy', { locale: vi });

export default function StaffDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const [myTasks, setMyTasks] = useState<TaskResponse[]>([]);
    const [poolTasks, setPoolTasks] = useState<TaskResponse[]>([]);
    const [activeTab, setActiveTab] = useState<'mine' | 'pool'>('mine');
    
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
<<<<<<< HEAD
    const [configuringTask, setConfiguringTask] = useState<TaskResponse | null>(null);
=======

    // Workspace states
    const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'info' | 'logs' | 'medical'>('info');
    
    // Care log states
>>>>>>> d31cefd31a91a041b11e628f9abfa6404f1e86da
    const [careLogs, setCareLogs] = useState<CareLogResponse[]>([]);
    const [careLogNote, setCareLogNote] = useState('');
    const [careLogType, setCareLogType] = useState('FEEDING');
    const [careLogImage, setCareLogImage] = useState<File | null>(null);
    const [submittingLog, setSubmittingLog] = useState(false);
    const [fullBooking, setFullBooking] = useState<BookingResponse | null>(null);
    const [rtspUrl, setRtspUrl] = useState('');
    const [configuringCamera, setConfiguringCamera] = useState(false);

    // Medical record states
    const [medicalForm, setMedicalForm] = useState<PetMedicalRecordRequest>({
        diagnosis: '', symptoms: '', treatment: '', prescription: '', notes: '', visitDate: new Date().toISOString()
    });
    const [submittingMedical, setSubmittingMedical] = useState(false);

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

    useEffect(() => { loadData(); }, []);

    // Handle deep links from old /staff/tasks
    useEffect(() => {
<<<<<<< HEAD
        const activeTask = selectedTask || configuringTask;
        if (activeTask) {
            fetchLogs(activeTask.bookingId);
            bookingService.getById(activeTask.bookingId).then(b => {
                setFullBooking(b);
                setRtspUrl(b.cameraRtspUrl || '');
            }).catch(console.error);
        } else {
            setFullBooking(null);
            setRtspUrl('');
        }
    }, [selectedTask, configuringTask]);
=======
        if (!loading && location.state?.taskId) {
            const task = myTasks.find(t => t.bookingId === location.state.taskId) || 
                         poolTasks.find(t => t.bookingId === location.state.taskId);
            if (task && (!selectedTask || selectedTask.bookingId !== task.bookingId)) {
                handleSelectTask(task);
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [loading, myTasks, poolTasks, location.state, selectedTask, navigate, location.pathname]);

    const handleSelectTask = async (task: TaskResponse | null) => {
        setSelectedTask(task);
        setActiveWorkspaceTab('info');
        setCareLogNote('');
        setCareLogImage(null);
        setMedicalForm({ diagnosis: '', symptoms: '', treatment: '', prescription: '', notes: '', visitDate: new Date().toISOString() });
        
        if (task) {
            try {
                const logs = await careLogService.getLogs(task.bookingId);
                setCareLogs(logs);
            } catch (e) {
                setCareLogs([]);
            }
        }
    };
>>>>>>> d31cefd31a91a041b11e628f9abfa6404f1e86da

    const handleUpdateStatus = async (bookingId: number, nextStatus: TaskStatus) => {
        setUpdatingId(bookingId);
        try {
            const updated = await taskService.updateStatus(bookingId, nextStatus);
            setMyTasks(prev => prev.map(t => t.bookingId === bookingId ? updated : t));
            if (selectedTask?.bookingId === bookingId) setSelectedTask(updated);
            toast.success(nextStatus === 'IN_PROGRESS' ? 'Đã bắt đầu công việc' : 'Đã hoàn thành công việc!');
        } catch (err: any) {
            const code = err?.response?.data?.code;
            if (code === 5016) {
                toast.error('Vui lòng điền Hồ sơ y tế trước khi hoàn thành!');
                setActiveWorkspaceTab('medical');
            } else {
                toast.error(err?.response?.data?.message || 'Thao tác thất bại');
            }
        } finally {
            setUpdatingId(null);
        }
    };

    const handleConfigureCamera = async () => {
        const targetTask = selectedTask || configuringTask;
        if (!targetTask || !rtspUrl.trim()) {
            toast.error('Vui lòng nhập đường dẫn RTSP');
            return;
        }
        setConfiguringCamera(true);
        try {
            const updated = await bookingService.configureCamera(targetTask.bookingId, rtspUrl);
            setFullBooking(updated);
            toast.success('Cấu hình camera thành công!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Cấu hình thất bại');
        } finally {
            setConfiguringCamera(false);
        }
    };

    const handleDeleteCamera = async () => {
        const targetTask = selectedTask || configuringTask;
        if (!targetTask) return;
        if (!window.confirm('Bạn có chắc muốn tắt camera?')) return;
        setConfiguringCamera(true);
        try {
            const updated = await bookingService.deleteCamera(targetTask.bookingId);
            setFullBooking(updated);
            setRtspUrl('');
            toast.success('Đã tắt camera');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Tắt camera thất bại');
        } finally {
            setConfiguringCamera(false);
        }
    };

    const handleClaimTask = async (bookingId: number) => {
        setUpdatingId(bookingId);
        try {
            const claimed = await taskService.claimTask(bookingId);
            setPoolTasks(prev => prev.filter(t => t.bookingId !== bookingId));
            setMyTasks(prev => [claimed, ...prev]);
            toast.success('Đã nhận công việc thành công!');
            setActiveTab('mine');
            if (selectedTask?.bookingId === bookingId) setSelectedTask(claimed);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Không thể nhận task');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAddCareLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!careLogNote.trim() || !selectedTask) return;
        
        setSubmittingLog(true);
        try {
            let imageUrl = '';
            if (careLogImage) {
                imageUrl = await fileService.uploadImage(careLogImage);
            }
            const newLog = await careLogService.addLog(selectedTask.bookingId, {
                type: careLogType,
                note: careLogNote,
                imageUrl
            });
            setCareLogs(prev => [newLog, ...prev]);
            setCareLogNote('');
            setCareLogImage(null);
            toast.success('Đã lưu nhật ký!');
        } catch {
            toast.error('Không thể lưu nhật ký');
        } finally {
            setSubmittingLog(false);
        }
    };

    const handleSubmitMedical = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask || !medicalForm.diagnosis) return;

<<<<<<< HEAD
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
                    
                    <div className="flex flex-col gap-2">
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
                        {task.checkOut && (
                            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100/50 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">Đến</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Clock size={16} className="text-indigo-500" />
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{formatTime(task.checkOut)}</span>
                                </div>
                                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                                <div className="flex items-center gap-2.5">
                                    <Calendar size={16} className="text-rose-500" />
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{formatDate(task.checkOut)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {!isPool ? (
                    next && (!task.checkOut || task.status !== 'IN_PROGRESS' || new Date() >= new Date(task.checkOut)) && (
                        <button
                            disabled={busy}
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (task.checkOut && task.status === 'CONFIRMED') {
                                    setConfiguringTask(task);
                                } else {
                                    handleUpdateStatus(task.bookingId, next); 
                                }
                            }}
                            className={`w-full py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl ${cfg.shadow} ${
                                next === 'IN_PROGRESS' 
                                ? 'bg-primary text-white hover:bg-primary-dark' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            } disabled:opacity-50`}
                        >
                            {busy ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
                            {busy ? 'Đang xử lý...' : (task.checkOut && task.status === 'CONFIRMED' ? 'Bắt đầu cấu hình' : (task.checkOut && task.status === 'IN_PROGRESS' ? 'Kết thúc lưu trú' : NEXT_LABEL[task.status]))}
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
=======
        setSubmittingMedical(true);
        try {
            await petMedicalService.createMedicalRecord(selectedTask.petId, medicalForm);
            toast.success('Đã lưu hồ sơ y tế thành công!');
            setActiveWorkspaceTab('info');
        } catch {
            toast.error('Không thể lưu hồ sơ y tế');
        } finally {
            setSubmittingMedical(false);
        }
>>>>>>> d31cefd31a91a041b11e628f9abfa6404f1e86da
    };

    const inProgressTasks = myTasks.filter(t => t.status === 'IN_PROGRESS');
    const pendingTasks = myTasks.filter(t => t.status === 'CONFIRMED');
    const displayTasks = activeTab === 'mine' ? myTasks : poolTasks;

    return (
        <div className="h-[calc(100vh-4rem)] bg-[#f8fafc] dark:bg-background-dark flex overflow-hidden">
            {/* LEFT PANEL: Task List */}
            <div className={`w-full lg:w-[400px] xl:w-[450px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full transition-transform duration-300 ${selectedTask ? 'hidden lg:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        Xin chào, {user?.name || 'Staff'} 👋
                    </h1>
                    
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setActiveTab('mine')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'mine' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <User size={16} /> Của tôi ({inProgressTasks.length + pendingTasks.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('pool')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'pool' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutGrid size={16} /> Kho chung ({poolTasks.length})
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : displayTasks.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle2 size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium">Không có công việc nào</p>
                        </div>
                    ) : (
                        displayTasks.map(task => (
                            <div 
                                key={task.bookingId} 
                                onClick={() => handleSelectTask(task)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                    selectedTask?.bookingId === task.bookingId 
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{task.petName}</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-1">{task.customerName}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase ${STATUS_CONFIG[task.status]?.color || 'bg-slate-50 text-slate-500'}`}>
                                        {STATUS_CONFIG[task.status]?.label || task.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                                    <ClipboardList size={14} className="text-primary" />
                                    <span className="font-medium truncate">{task.serviceName}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1"><Clock size={14} /> {formatTime(task.appointmentDatetime)}</div>
                                    <div className="flex items-center gap-1"><Calendar size={14} /> {formatDate(task.appointmentDatetime)}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Workspace Detail */}
            {selectedTask ? (
                <div className={`fixed inset-0 z-50 lg:static lg:z-auto lg:flex-1 bg-slate-50 dark:bg-background-dark flex flex-col h-full transition-transform duration-300`}>
                    {/* Header Mobile Support */}
                    <div className="lg:hidden flex items-center gap-4 p-4 bg-white border-b border-slate-200 pt-8">
                        <button onClick={() => handleSelectTask(null)} className="p-2 -ml-2 text-slate-600 bg-slate-100 rounded-full">
                            <X size={20} />
                        </button>
                        <h2 className="font-bold text-lg">Chi tiết công việc</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                        <div className="max-w-4xl mx-auto space-y-6">
                            
                            {/* Main Info Card */}
                            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200">
                                <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-slate-100 relative shrink-0">
                                            🐾
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">{selectedTask.petName}</h2>
                                            <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                                                <span className="font-medium text-slate-600 flex items-center gap-1"><User size={14} /> {selectedTask.customerName}</span>
                                                <span className="hidden sm:inline text-slate-300">|</span>
                                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${STATUS_CONFIG[selectedTask.status]?.color}`}>
                                                    {STATUS_CONFIG[selectedTask.status]?.label}
                                                </span>
                                            </div>
<<<<<<< HEAD
                                            <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{selectedTask.petName}</h4>
                                            <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-8 shadow-sm ${STATUS_CONFIG[selectedTask.status]?.color}`}>
                                                {STATUS_CONFIG[selectedTask.status]?.label}
                                            </div>

                                            <div className="w-full space-y-4">
                                                {[
                                                    { label: 'Chủ nuôi', value: selectedTask.customerName, icon: User, color: 'text-primary bg-primary/5' },
                                                    { label: 'Dịch vụ', value: selectedTask.serviceName, icon: ClipboardList, color: 'text-amber-600 bg-amber-50' },
                                                    { label: selectedTask.checkOut ? 'Bắt đầu' : 'Lịch hẹn', value: `${formatTime(selectedTask.appointmentDatetime)} - ${formatDate(selectedTask.appointmentDatetime)}`, icon: Clock, color: 'text-indigo-600 bg-indigo-50' },
                                                    ...(selectedTask.checkOut ? [{ label: 'Kết thúc', value: `${formatTime(selectedTask.checkOut)} - ${formatDate(selectedTask.checkOut)}`, icon: Calendar, color: 'text-rose-600 bg-rose-50' }] : [])
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

                                            {/* Camera Configuration for Boarding */}
                                            {fullBooking && selectedTask.checkOut && (
                                                <div className="w-full mt-6 p-6 bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-3xl text-left text-white shadow-xl">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                                            <Camera size={14} /> Cấu hình Camera - Phòng P-{(fullBooking.id % 20) + 101}
                                                        </p>
                                                        {fullBooking.cameraStreamUrl && (
                                                            <span className="flex h-2.5 w-2.5 relative">
                                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
                                                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/50">
                                                            <p className="text-slate-500 mb-1 text-[9px] font-black uppercase tracking-widest">Kích thước chuồng</p>
                                                            <p className="font-bold">{fullBooking.cageSize || 'Tiêu chuẩn'}</p>
                                                        </div>
                                                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/50">
                                                            <p className="text-slate-500 mb-1 text-[9px] font-black uppercase tracking-widest">Loại phòng</p>
                                                            <p className="font-bold text-amber-400">{fullBooking.roomType || 'Thường'}</p>
                                                        </div>

                                                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/50">
                                                            <p className="text-slate-500 mb-1 text-[9px] font-black uppercase tracking-widest">Trạng thái kết nối</p>
                                                            <p className="font-bold text-emerald-400">Sẵn sàng ({fullBooking.cameraEnabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'})</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">RTSP Stream URL</label>
                                                            <div className="flex gap-2">
                                                                <input 
                                                                    type="text" 
                                                                    value={rtspUrl}
                                                                    onChange={e => setRtspUrl(e.target.value)}
                                                                    placeholder="rtsp://admin:pass@ip:port/stream"
                                                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                                                />
                                                                <button 
                                                                    onClick={handleConfigureCamera}
                                                                    disabled={configuringCamera || !rtspUrl.trim()}
                                                                    className="px-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold disabled:opacity-50 transition-all flex items-center justify-center min-w-[70px]"
                                                                >
                                                                    {configuringCamera ? <Loader2 size={14} className="animate-spin" /> : 'Lưu'}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {fullBooking.cameraStreamUrl && (
                                                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                                                <p className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
                                                                    <span>TRẠNG THÁI</span>
                                                                    <button onClick={handleDeleteCamera} className="text-rose-400 hover:text-rose-300">Tắt Camera</button>
                                                                </p>
                                                                <p className="text-xs text-emerald-400 font-mono break-all">Đang phát</p>
                                                                {fullBooking.cameraConfiguredAt && (
                                                                    <p className="text-[9px] text-slate-400 mt-2 italic">
                                                                        Bắt đầu: {format(parseISO(fullBooking.cameraConfiguredAt), 'HH:mm dd/MM/yyyy')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

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
=======
>>>>>>> d31cefd31a91a041b11e628f9abfa6404f1e86da
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-3 min-w-[200px]">
                                        {activeTab === 'pool' ? (
                                            <button 
                                                onClick={() => handleClaimTask(selectedTask.bookingId)}
                                                disabled={updatingId === selectedTask.bookingId}
                                                className="w-full py-3 bg-[#1a2b4c] text-white rounded-xl font-bold text-sm shadow-md hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                                            >
                                                {updatingId === selectedTask.bookingId ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
                                                Nhận ca trực
                                            </button>
                                        ) : (
                                            <>
                                                {selectedTask.status === 'CONFIRMED' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(selectedTask.bookingId, 'IN_PROGRESS')}
                                                        disabled={updatingId === selectedTask.bookingId}
                                                        className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {updatingId === selectedTask.bookingId ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} 
                                                        Bắt đầu làm
                                                    </button>
                                                )}
                                                {selectedTask.status === 'IN_PROGRESS' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(selectedTask.bookingId, 'COMPLETED')}
                                                        disabled={updatingId === selectedTask.bookingId}
                                                        className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {updatingId === selectedTask.bookingId ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} 
                                                        Hoàn thành
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

<<<<<<< HEAD
                                    {/* Right Panel: Operations & Logs */}
                                    <div className="flex-1 p-8 sm:p-10 lg:p-12 flex flex-col h-full">
                                        
                                        {/* Tabs for Logging / Chat */}
                                        <div className="flex items-center justify-center gap-4 mb-8">
                                            <button className="flex-1 py-3 px-6 bg-white dark:bg-slate-800 text-primary font-black text-sm rounded-full shadow-sm border border-slate-100 dark:border-slate-700 transition-all text-center">
                                                Nhật ký
                                            </button>
                                            <button className="flex-1 py-3 px-6 bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold text-sm rounded-full transition-all text-center hover:bg-slate-100">
                                                Trò chuyện
                                            </button>
                                        </div>

                                        {/* Activity Logging Section */}
                                        {selectedTask.status === 'IN_PROGRESS' ? (
                                            <div className="mb-12">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <Plus size={18} className="text-primary" />
                                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Cập nhật sức khỏe hoạt động của Pet</p>
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
=======
                            {/* Workspace Tabs */}
                            {activeTab === 'mine' && selectedTask.status !== 'CONFIRMED' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="flex border-b border-slate-100 overflow-x-auto custom-scrollbar">
                                        <button 
                                            onClick={() => setActiveWorkspaceTab('info')}
                                            className={`flex-1 min-w-[120px] py-4 text-sm font-bold border-b-2 transition-all ${activeWorkspaceTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            Thông tin chung
                                        </button>
                                        {(selectedTask.status === 'IN_PROGRESS' || selectedTask.status === 'COMPLETED') && (
                                            <button 
                                                onClick={() => setActiveWorkspaceTab('logs')}
                                                className={`flex-1 min-w-[140px] py-4 text-sm font-bold border-b-2 transition-all ${activeWorkspaceTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                                            >
                                                Nhật ký chăm sóc
                                            </button>
                                        )}
                                        {guessCategory(selectedTask.serviceName) === 'CLINIC' && (selectedTask.status === 'IN_PROGRESS' || selectedTask.status === 'COMPLETED') && (
                                            <button 
                                                onClick={() => setActiveWorkspaceTab('medical')}
                                                className={`flex-1 min-w-[120px] py-4 text-sm font-bold border-b-2 transition-all ${activeWorkspaceTab === 'medical' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                                            >
                                                Hồ sơ y tế
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-4 lg:p-6">
                                        {activeWorkspaceTab === 'info' && (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <div className="flex items-center gap-2 mb-2 text-primary font-bold text-sm">
                                                            <ClipboardList size={16} /> Dịch vụ
                                                        </div>
                                                        <p className="font-semibold text-slate-800">{selectedTask.serviceName}</p>
>>>>>>> d31cefd31a91a041b11e628f9abfa6404f1e86da
                                                    </div>
                                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-sm">
                                                            <Clock size={16} /> Thời gian hẹn
                                                        </div>
                                                        <p className="font-semibold text-slate-800">{formatTime(selectedTask.appointmentDatetime)} - {formatDate(selectedTask.appointmentDatetime)}</p>
                                                    </div>
                                                </div>
                                                {selectedTask.note && (
                                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                                        <div className="flex items-center gap-2 mb-2 text-amber-600 font-bold text-sm">
                                                            <AlertCircle size={16} /> Ghi chú từ khách hàng
                                                        </div>
                                                        <p className="text-amber-900 text-sm font-medium">{selectedTask.note}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeWorkspaceTab === 'logs' && (
                                            <div className="space-y-8">
                                                {selectedTask.status === 'IN_PROGRESS' && (
                                                    <form onSubmit={handleAddCareLog} className="bg-slate-50 p-4 lg:p-5 rounded-3xl border border-slate-100">
                                                        <h3 className="font-bold text-slate-900 mb-4">Thêm nhật ký mới</h3>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                                            {CARE_LOG_TYPES.map(type => (
                                                                <button
                                                                    key={type.id}
                                                                    type="button"
                                                                    onClick={() => setCareLogType(type.id)}
                                                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                                                                        careLogType === type.id 
                                                                        ? 'bg-primary text-white border-primary shadow-sm' 
                                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-primary/30'
                                                                    }`}
                                                                >
                                                                    <type.icon size={18} />
                                                                    <span className="text-xs font-semibold">{type.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <textarea 
                                                            value={careLogNote}
                                                            onChange={(e) => setCareLogNote(e.target.value)}
                                                            placeholder="Mô tả nội dung chăm sóc..."
                                                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24 mb-4"
                                                            required
                                                        />
<<<<<<< HEAD
                                                        <button 
                                                            type="submit"
                                                            disabled={submittingLog || !careLogNote.trim()}
                                                            className="absolute bottom-4 right-4 p-3.5 bg-primary text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                                        >
                                                            {submittingLog ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                                        </button>
                                                    </div>
                                                </form>
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
                                                    Bắt đầu {selectedTask.checkOut ? 'cấu hình' : 'ngay'}
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
=======
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                            <div className="flex items-center gap-4">
                                                                <label className="cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto">
                                                                    <Camera size={18} />
                                                                    {careLogImage ? 'Đã chọn ảnh' : 'Đính kèm ảnh'}
                                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setCareLogImage(e.target.files?.[0] || null)} />
                                                                </label>
                                                                {careLogImage && <span className="text-xs text-green-600 font-medium whitespace-nowrap">✓ Sẵn sàng</span>}
                                                            </div>
                                                            <button 
                                                                type="submit"
                                                                disabled={submittingLog}
                                                                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
>>>>>>> d31cefd31a91a041b11e628f9abfa6404f1e86da
                                                            >
                                                                {submittingLog ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Lưu nhật ký
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}

                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-slate-900">Lịch sử chăm sóc</h3>
                                                    {careLogs.length === 0 ? (
                                                        <p className="text-slate-500 text-sm text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">Chưa có nhật ký nào được ghi lại.</p>
                                                    ) : (
                                                        careLogs.map((log) => {
                                                            const typeCfg = CARE_LOG_TYPES.find(t => t.id === log.type) || CARE_LOG_TYPES[0];
                                                            const LogIcon = typeCfg.icon;
                                                            return (
                                                                <div key={log.id} className="flex gap-4 p-4 lg:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeCfg.color}`}>
                                                                        <LogIcon size={20} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <span className="font-bold text-sm truncate pr-2">{typeCfg.label}</span>
                                                                            <span className="text-xs font-semibold text-slate-400 shrink-0">{formatTime(log.timestamp)}</span>
                                                                        </div>
                                                                        <p className="text-slate-700 text-sm break-words">{log.note}</p>
                                                                        {log.imageUrl && (
                                                                            <img src={log.imageUrl} alt="Care log" className="mt-3 rounded-xl max-h-48 object-cover border border-slate-100" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {activeWorkspaceTab === 'medical' && guessCategory(selectedTask.serviceName) === 'CLINIC' && (
                                            <div className="space-y-6">
                                                {selectedTask.status === 'COMPLETED' ? (
                                                    <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100">
                                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                            <CheckCircle2 size={32} />
                                                        </div>
                                                        <h3 className="font-bold text-slate-900 mb-2">Ca khám đã hoàn thành</h3>
                                                        <p className="text-slate-500 text-sm">Hồ sơ y tế đã được lưu trữ an toàn.</p>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={handleSubmitMedical} className="space-y-5">
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">Chẩn đoán <span className="text-red-500">*</span></label>
                                                            <input 
                                                                type="text" required
                                                                value={medicalForm.diagnosis}
                                                                onChange={e => setMedicalForm({...medicalForm, diagnosis: e.target.value})}
                                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all"
                                                                placeholder="Nhập kết luận chẩn đoán..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">Triệu chứng</label>
                                                            <textarea 
                                                                value={medicalForm.symptoms}
                                                                onChange={e => setMedicalForm({...medicalForm, symptoms: e.target.value})}
                                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all h-24 resize-none"
                                                                placeholder="Mô tả triệu chứng lâm sàng..."
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div>
                                                                <label className="block text-sm font-bold text-slate-700 mb-2">Đơn thuốc</label>
                                                                <textarea 
                                                                    value={medicalForm.prescription}
                                                                    onChange={e => setMedicalForm({...medicalForm, prescription: e.target.value})}
                                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all h-24 resize-none"
                                                                    placeholder="Kê đơn thuốc..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-bold text-slate-700 mb-2">Hướng dẫn điều trị</label>
                                                                <textarea 
                                                                    value={medicalForm.treatment}
                                                                    onChange={e => setMedicalForm({...medicalForm, treatment: e.target.value})}
                                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all h-24 resize-none"
                                                                    placeholder="Phương pháp điều trị..."
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="pt-4 flex justify-end">
                                                            <button 
                                                                type="submit"
                                                                disabled={submittingMedical}
                                                                className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                            >
                                                                {submittingMedical ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Lưu hồ sơ
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
<<<<<<< HEAD
                            </div>

                            {/* Modal Footer (Always Visible) */}
                            <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
                                    {NEXT_STATUS[selectedTask.status] && (!selectedTask.checkOut || selectedTask.status !== 'IN_PROGRESS' || new Date() >= new Date(selectedTask.checkOut)) && (
                                        <button 
                                            disabled={updating === selectedTask.bookingId}
                                            onClick={() => handleUpdateStatus(selectedTask.bookingId, NEXT_STATUS[selectedTask.status]!)}
                                            className="flex-[2] py-4.5 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3"
                                        >
                                            {updating === selectedTask.bookingId ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                            {updating === selectedTask.bookingId ? 'Đang cập nhật...' : (selectedTask.checkOut && selectedTask.status === 'CONFIRMED' ? 'Bắt đầu cấu hình' : (selectedTask.checkOut && selectedTask.status === 'IN_PROGRESS' ? 'Kết thúc lưu trú' : NEXT_LABEL[selectedTask.status]))}
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

            {/* CONFIGURATION POPUP */}
            <AnimatePresence>
                {configuringTask && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setConfiguringTask(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden"
                        >
                            <button 
                                onClick={() => setConfiguringTask(null)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-xl bg-slate-800/50"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-[1.2rem] bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                                    <Camera size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">Cấu hình Camera</h3>
                                    {fullBooking ? (
                                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                            Phòng P-{(fullBooking.id % 20) + 101}
                                            {fullBooking.cameraStreamUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />}
                                        </p>
                                    ) : (
                                        <div className="w-20 h-4 bg-slate-800 rounded animate-pulse mt-2" />
                                    )}
                                </div>
                            </div>

                            {fullBooking ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                                            <p className="text-slate-500 mb-1.5 text-[9px] font-black uppercase tracking-widest">Kích thước chuồng</p>
                                            <p className="font-bold text-slate-200">{fullBooking.cageSize || 'Tiêu chuẩn'}</p>
                                        </div>
                                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                                            <p className="text-slate-500 mb-1.5 text-[9px] font-black uppercase tracking-widest">Loại phòng</p>
                                            <p className="font-bold text-amber-400">{fullBooking.roomType || 'Thường'}</p>
                                        </div>

                                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                                            <p className="text-slate-500 mb-1.5 text-[9px] font-black uppercase tracking-widest">Trạng thái kết nối</p>
                                            <p className="font-bold text-emerald-400">Sẵn sàng</p>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block">Đường dẫn RTSP</label>
                                        <input 
                                            type="text" 
                                            value={rtspUrl}
                                            onChange={e => setRtspUrl(e.target.value)}
                                            placeholder="rtsp://admin:pass@ip:port/stream"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors shadow-inner mb-6"
                                        />

                                        <button 
                                            onClick={async () => {
                                                await handleConfigureCamera();
                                                setConfiguringTask(null);
                                                handleUpdateStatus(configuringTask.bookingId, 'IN_PROGRESS');
                                            }}
                                            disabled={configuringCamera || !rtspUrl.trim()}
                                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-[1.5rem] font-black text-sm uppercase tracking-widest disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20"
                                        >
                                            {configuringCamera ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
                                            {configuringCamera ? 'Đang lưu...' : 'Lưu & Bắt đầu ca trực'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-16 flex flex-col items-center justify-center gap-4">
                                    <Loader2 size={32} className="animate-spin text-blue-500" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Đang tải thông tin phòng...</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
=======
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden lg:flex flex-1 bg-slate-50/50 dark:bg-slate-950 items-center justify-center p-8">
                    <div className="text-center max-w-sm">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Sparkles size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Chọn một công việc</h2>
                        <p className="text-slate-500 font-medium">Chọn một công việc từ danh sách bên trái để xem chi tiết và bắt đầu làm việc.</p>
                    </div>
                </div>
            )}
>>>>>>> d31cefd31a91a041b11e628f9abfa6404f1e86da
        </div>
    );
}
