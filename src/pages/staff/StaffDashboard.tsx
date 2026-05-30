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

    // Workspace states
    const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'info' | 'logs' | 'medical'>('info');
    
    // Care log states
    const [careLogs, setCareLogs] = useState<CareLogResponse[]>([]);
    const [careLogNote, setCareLogNote] = useState('');
    const [careLogType, setCareLogType] = useState('FEEDING');
    const [careLogImage, setCareLogImage] = useState<File | null>(null);
    const [submittingLog, setSubmittingLog] = useState(false);

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
        </div>
    );
}
