import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Search, Filter, Clock, User, Phone, 
    Camera, CheckCircle, Play, MoreVertical, 
    Image as ImageIcon, Video, ChevronRight, AlertCircle, Loader2,
    X, Mail, Heart, Info, Scissors, Activity, Syringe, Utensils, Award, Send, Check, ShieldCheck, Sparkles, Calendar, BookOpen, Plus, Save
} from 'lucide-react';
import { taskService, type TaskResponse } from '../../services/task.service';
import { petService } from '../../services/pet.service';
import { fileService } from '../../services/file.service';
import { careLogService, type CareLogResponse } from '../../services/care-log.service';
import { petMedicalService, type PetMedicalRecordRequest } from '../../services/pet-medical.service';
import { type Pet } from '../../types';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

type InternalStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'all';

const CARE_LOG_TYPES = [
    { id: 'FEEDING', label: 'Cho ăn', icon: Utensils, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400' },
    { id: 'CLEANING', label: 'Vệ sinh', icon: Activity, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400' },
    { id: 'MEDICAL', label: 'Y tế', icon: Syringe, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400' },
    { id: 'EXERCISE', label: 'Vui chơi', icon: Heart, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400' },
];

export default function StaffTasks() {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<InternalStatus>('all');
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Modal state
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [loadingPet, setLoadingPet] = useState(false);
    const [careLogs, setCareLogs] = useState<CareLogResponse[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [activeRightTab, setActiveRightTab] = useState<'pet' | 'logs' | 'medical'>('pet');
    const [activePetSubTab, setActivePetSubTab] = useState<'info' | 'medical' | 'nutrition'>('info');
    const [careLogNote, setCareLogNote] = useState('');
    const [careLogType, setCareLogType] = useState('FEEDING');
    const [careLogImage, setCareLogImage] = useState<File | null>(null);
    const [submittingLog, setSubmittingLog] = useState(false);

    // Medical form state
    const [medicalForm, setMedicalForm] = useState<PetMedicalRecordRequest>({
        diagnosis: '', symptoms: '', treatment: '', prescription: '', notes: '', visitDate: new Date().toISOString()
    });
    const [submittingMedical, setSubmittingMedical] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const data = await taskService.getMyTasks();
            setTasks(data);
        } catch {
            toast.error('Không thể tải danh sách công việc');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && tasks.length > 0 && location.state?.taskId) {
            const task = tasks.find(t => t.bookingId === location.state.taskId);
            if (task && (!selectedTask || selectedTask.bookingId !== task.bookingId)) {
                handleOpenTaskDetail(task);
                // Clear the state so it doesn't reopen on subsequent re-renders if closed
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [loading, tasks, location.state, selectedTask, navigate, location.pathname]);

    const handleUpdateStatus = async (bookingId: number, status: 'IN_PROGRESS' | 'COMPLETED') => {
        setUpdatingId(bookingId);
        try {
            const updated = await taskService.updateStatus(bookingId, status);
            setTasks(prev => prev.map(t => t.bookingId === bookingId ? updated : t));
            toast.success(status === 'IN_PROGRESS' ? 'Đã bắt đầu công việc' : 'Đã hoàn thành công việc!');
            if (selectedTask?.bookingId === bookingId) {
                setSelectedTask(updated);
            }
        } catch (err: any) {
            const errCode = err?.response?.data?.code;
            if (errCode === 5016) {
                toast.error('Vui lòng điền Hồ sơ y tế cho thú cưng trước khi hoàn thành dịch vụ phòng khám!');
                setActiveRightTab('medical');
            } else {
                toast.error(err?.response?.data?.message || 'Cập nhật trạng thái thất bại');
            }
        } finally {
            setUpdatingId(null);
        }
    };

    const handleOpenTaskDetail = async (task: TaskResponse) => {
        setSelectedTask(task);
        setActiveRightTab('pet');
        setActivePetSubTab('info');
        setCareLogNote('');
        setCareLogType('FEEDING');
        setCareLogs([]);
        setSelectedPet(null);
        
        // Load Pet details
        setLoadingPet(true);
        try {
            const petData = await petService.getById(task.petId);
            setSelectedPet(petData);
        } catch (error) {
            console.error('Không thể tải hồ sơ thú cưng:', error);
        } finally {
            setLoadingPet(false);
        }

        // Load Care logs
        setLoadingLogs(true);
        try {
            const logsData = await careLogService.getLogs(task.bookingId);
            setCareLogs(logsData);
        } catch (error) {
            console.error('Không thể tải nhật ký chăm sóc:', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleAddCareLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!careLogNote.trim() || !selectedTask) return;
        
        setSubmittingLog(true);
        try {
            let imageUrl = undefined;
            if (careLogImage) {
                imageUrl = await fileService.upload(careLogImage);
            }

            const newLog = await careLogService.addLog(selectedTask.bookingId, {
                type: careLogType,
                note: careLogNote,
                imageUrl
            });
            setCareLogs(prev => [newLog, ...prev]);
            setCareLogNote('');
            setCareLogImage(null);
            toast.success('Đã lưu nhật ký chăm sóc!');
        } catch {
            toast.error('Không thể lưu nhật ký');
        } finally {
            setSubmittingLog(false);
        }
    };

    const handleAddMedicalRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask || !medicalForm.diagnosis.trim() || !medicalForm.treatment.trim() || !medicalForm.prescription.trim()) {
            toast.error('Vui lòng điền đầy đủ Chẩn đoán, Điều trị và Đơn thuốc');
            return;
        }
        setSubmittingMedical(true);
        try {
            await petMedicalService.addMedicalRecord(selectedTask.bookingId, medicalForm);
            toast.success('Đã lưu hồ sơ y tế thành công!');
            setMedicalForm({ diagnosis: '', symptoms: '', treatment: '', prescription: '', notes: '', visitDate: new Date().toISOString() });
            
            // Reload pet details to show the new record in pet tab
            const petData = await petService.getById(selectedTask.petId);
            setSelectedPet(petData);
            
            // Redirect to pet medical tab to view it
            setActiveRightTab('pet');
            setActivePetSubTab('medical');
        } catch {
            toast.error('Không thể lưu hồ sơ y tế');
        } finally {
            setSubmittingMedical(false);
        }
    };

    const getPetAge = (dobString?: string) => {
        if (!dobString) return 'Không rõ';
        try {
            const birth = new Date(dobString);
            const now = new Date();
            let years = now.getFullYear() - birth.getFullYear();
            let months = now.getMonth() - birth.getMonth();
            if (months < 0) {
                years--;
                months += 12;
            }
            if (years === 0) {
                return `${months} tháng`;
            }
            return `${years} tuổi ${months > 0 ? `${months} tháng` : ''}`;
        } catch {
            return 'Không rõ';
        }
    };

    const statusColors: Record<string, string> = {
        CONFIRMED: 'bg-orange-100 text-orange-600',
        IN_PROGRESS: 'bg-blue-100 text-blue-600',
        COMPLETED: 'bg-green-100 text-green-600'
    };

    const statusLabels: Record<string, string> = {
        CONFIRMED: 'Chờ thực hiện',
        IN_PROGRESS: 'Đang làm',
        COMPLETED: 'Đã xong'
    };

    const filteredTasks = tasks.filter(t => activeTab === 'all' || t.status === activeTab);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Danh sách ca trực</h1>
                        <p className="text-slate-500 font-medium">Quản lý và cập nhật tiến độ công việc</p>
                    </div>
                    
                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
                        {(['all', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                                    activeTab === tab 
                                    ? 'bg-[#1a2b4c] text-white shadow-md' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {tab === 'all' ? 'Tất cả' : statusLabels[tab]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                        <Loader2 size={40} className="animate-spin opacity-20" />
                        <p className="font-bold">Đang tải danh sách công việc...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">Không có công việc nào</h3>
                        <p className="text-sm text-slate-500">Tận hưởng thời gian nghỉ ngơi của bạn!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTasks.map((task) => (
                            <div 
                                key={task.bookingId} 
                                onClick={() => handleOpenTaskDetail(task)}
                                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100/50 transition-all duration-500 group cursor-pointer"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Pet Avatar Placeholder */}
                                    <div className="w-full md:w-32 h-32 bg-slate-100 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                                        <ImageIcon size={32} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-black text-slate-900">{task.petName}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[task.status] || 'bg-slate-100 text-slate-500'}`}>
                                                        {statusLabels[task.status] || task.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-indigo-500">{task.serviceName}</p>
                                            </div>
                                            <button 
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
                                            >
                                                <MoreVertical size={20} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <User size={14} className="text-slate-400" />
                                                <span className="font-bold text-slate-700">{task.customerName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Clock size={14} className="text-slate-400" />
                                                <span>Giờ hẹn: <span className="font-bold text-slate-700">
                                                    {format(new Date(task.appointmentDatetime), 'HH:mm - dd/MM', { locale: vi })}
                                                </span></span>
                                            </div>
                                        </div>

                                        {task.note && (
                                            <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                                <AlertCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                                                <p className="text-[11px] text-orange-700 leading-relaxed font-medium">
                                                    {task.note}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div 
                                        className="flex flex-row md:flex-col justify-center gap-2 shrink-0 md:border-l md:border-slate-100 md:pl-6"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {task.status === 'CONFIRMED' && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUpdateStatus(task.bookingId, 'IN_PROGRESS');
                                                }}
                                                disabled={updatingId === task.bookingId}
                                                className="flex-1 md:w-32 py-3 bg-[#1a2b4c] text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-900/10 hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50">
                                                {updatingId === task.bookingId ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} 
                                                Bắt đầu
                                            </button>
                                        )}
                                        {task.status === 'IN_PROGRESS' && (
                                            <>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenTaskDetail(task).then(() => {
                                                            setActiveRightTab('logs');
                                                        });
                                                    }}
                                                    className="flex-1 md:w-32 py-3 bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/10 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                                    <Camera size={14} /> Báo cáo
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateStatus(task.bookingId, 'COMPLETED');
                                                    }}
                                                    disabled={updatingId === task.bookingId}
                                                    className="flex-1 md:w-32 py-3 bg-green-500 text-white rounded-xl text-xs font-black shadow-lg shadow-green-500/10 hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50">
                                                    {updatingId === task.bookingId ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                    Xong
                                                </button>
                                            </>
                                        )}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenTaskDetail(task);
                                            }}
                                            className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            <AnimatePresence>
                {selectedTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 overflow-hidden">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTask(null)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
                        />
                        
                        {/* Modal Dialog */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.96, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 30 }}
                            className="relative w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] bg-white dark:bg-slate-900 rounded-none sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 z-[40] flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Chi tiết ca trực</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Booking: #{selectedTask.bookingId}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedTask(null)}
                                    className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                <div className="flex flex-col lg:flex-row h-full">
                                    
                                    {/* Left Panel: Booking & Customer Details */}
                                    <div className="lg:w-[38%] p-6 sm:p-8 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                            <Info size={16} /> Thông tin dịch vụ
                                        </h4>
                                        
                                        <div className="space-y-4">
                                            {/* Status Badge */}
                                            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Trạng thái</span>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[selectedTask.status] || 'bg-slate-100 text-slate-500'}`}>
                                                    {statusLabels[selectedTask.status] || selectedTask.status}
                                                </span>
                                            </div>

                                            {/* Service Name */}
                                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Dịch vụ chăm sóc</p>
                                                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{selectedTask.serviceName}</p>
                                            </div>

                                            {/* Appointment Time */}
                                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                                                <Clock className="text-slate-400" size={18} />
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Giờ hẹn</p>
                                                    <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                                                        {format(new Date(selectedTask.appointmentDatetime), 'HH:mm - EEEE, dd/MM/yyyy', { locale: vi })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Staff Name */}
                                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                                                <User className="text-slate-400" size={18} />
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nhân viên phụ trách</p>
                                                    <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                                                        {selectedTask.staffName || 'Chưa phân công'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Customer Contact */}
                                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Khách hàng liên hệ</p>
                                                <p className="text-sm font-black text-slate-800 dark:text-slate-200">{selectedTask.customerName}</p>
                                                
                                                {selectedTask.customerPhone && (
                                                    <a 
                                                        href={`tel:${selectedTask.customerPhone}`}
                                                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                                                    >
                                                        <Phone size={14} className="text-slate-400" />
                                                        {selectedTask.customerPhone}
                                                    </a>
                                                )}
                                                
                                                {selectedTask.customerEmail && (
                                                    <a 
                                                        href={`mailto:${selectedTask.customerEmail}`}
                                                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors truncate"
                                                    >
                                                        <Mail size={14} className="text-slate-400" />
                                                        {selectedTask.customerEmail}
                                                    </a>
                                                )}
                                            </div>

                                            {/* Customer Note */}
                                            {selectedTask.note && (
                                                <div className="p-5 bg-orange-50/70 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                                                    <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                        <AlertCircle size={14} /> Ghi chú đặc biệt
                                                    </p>
                                                    <p className="text-xs text-orange-900 dark:text-orange-200 font-bold leading-relaxed italic">
                                                        "{selectedTask.note}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Right Panel: Tabs Container */}
                                    <div className="flex-1 p-6 sm:p-8 flex flex-col overflow-hidden">
                                        
                                        {/* Right Tab Switcher */}
                                        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6 self-start shrink-0 sticky top-0 z-10 shadow-sm">
                                            <button 
                                                onClick={() => setActiveRightTab('pet')}
                                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                                                    activeRightTab === 'pet'
                                                    ? 'bg-white dark:bg-slate-705 text-indigo-600 dark:text-white shadow-md'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                                                }`}
                                            >
                                                🐾 Hồ sơ thú cưng
                                            </button>
                                            <button 
                                                onClick={() => setActiveRightTab('logs')}
                                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                                                    activeRightTab === 'logs'
                                                    ? 'bg-white dark:bg-slate-705 text-indigo-600 dark:text-white shadow-md'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                                                }`}
                                            >
                                                📋 Nhật ký chăm sóc ({careLogs.length})
                                            </button>
                                            <button 
                                                onClick={() => setActiveRightTab('medical')}
                                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                                                    activeRightTab === 'medical'
                                                    ? 'bg-white dark:bg-slate-705 text-emerald-600 dark:text-white shadow-md'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                                                }`}
                                            >
                                                🏥 Hồ sơ y tế
                                            </button>
                                        </div>

                                        {/* Tab Content */}
                                        <div className="flex-1 overflow-y-auto pr-1">
                                            {activeRightTab === 'pet' ? (
                                                loadingPet ? (
                                                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400 dark:text-slate-600">
                                                        <Loader2 size={36} className="animate-spin opacity-40 text-indigo-600" />
                                                        <p className="font-bold text-xs">Đang tải hồ sơ thú cưng...</p>
                                                    </div>
                                                ) : !selectedPet ? (
                                                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                                                        <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
                                                        <p className="text-sm font-bold text-slate-500">Không tìm thấy thông tin chi tiết thú cưng</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        {/* Pet Header Card */}
                                                        <div className="bg-gradient-to-r from-[#1a2b4c]/95 to-indigo-950 text-white rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row items-center gap-6">
                                                            <div className="relative shrink-0">
                                                                {selectedPet.avatar ? (
                                                                    <img 
                                                                        src={selectedPet.avatar} 
                                                                        alt={selectedPet.name} 
                                                                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-md"
                                                                    />
                                                                ) : (
                                                                    <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center border-4 border-white/10 shadow-md text-4xl">
                                                                        🐾
                                                                    </div>
                                                                )}
                                                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-[#1a2b4c]">
                                                                    <Sparkles size={14} className="text-white" />
                                                                </div>
                                                            </div>

                                                            <div className="text-center sm:text-left space-y-2">
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                                    <h5 className="text-2xl font-black tracking-tight">{selectedPet.name}</h5>
                                                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider self-center ${
                                                                        selectedPet.gender === 'Đực' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
                                                                    }`}>
                                                                        {selectedPet.gender}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-indigo-200 font-bold">
                                                                    {selectedPet.species} • {selectedPet.breed || 'Chưa xác định giống'}
                                                                </p>
                                                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                                                                    <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-lg">
                                                                        Tuổi: {getPetAge(selectedPet.dob)}
                                                                    </span>
                                                                    <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-lg">
                                                                        Cân nặng: {selectedPet.weight ? `${selectedPet.weight} kg` : 'N/A'}
                                                                    </span>
                                                                    {selectedPet.sterilized && (
                                                                        <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg flex items-center gap-1">
                                                                            <Check size={10} /> Đã triệt sản
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Sub tabs switcher */}
                                                        <div className="flex border-b border-slate-100 dark:border-slate-800 gap-6">
                                                            {[
                                                                { id: 'info', label: 'Thông tin chung', icon: Info },
                                                                { id: 'medical', label: 'Lịch sử y tế', icon: Syringe },
                                                                { id: 'nutrition', label: 'Khẩu phần ăn', icon: Utensils },
                                                            ].map(subTab => (
                                                                <button
                                                                    key={subTab.id}
                                                                    onClick={() => setActivePetSubTab(subTab.id as any)}
                                                                    className={`pb-3 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 relative -mb-px ${
                                                                        activePetSubTab === subTab.id
                                                                        ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                                                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                                                                    }`}
                                                                >
                                                                    <subTab.icon size={14} />
                                                                    {subTab.label}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Sub tab content */}
                                                        <div className="pt-2">
                                                            {activePetSubTab === 'info' && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Màu lông</p>
                                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedPet.color || 'Không ghi nhận'}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Món ăn yêu thích</p>
                                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedPet.favoriteFood || 'Không ghi nhận'}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sở thích</p>
                                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedPet.hobbies || 'Không ghi nhận'}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Giờ đi dạo lý tưởng</p>
                                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedPet.walkTime ? `${selectedPet.walkTime} phút/ngày` : 'Không ghi nhận'}</p>
                                                                    </div>
                                                                    {selectedPet.allergies && (
                                                                        <div className="col-span-1 md:col-span-2 p-4 bg-rose-50/70 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-1">
                                                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                                                                                <AlertCircle size={12} /> Dị ứng / Lưu ý tránh
                                                                            </p>
                                                                            <p className="text-xs font-bold text-rose-900 dark:text-rose-200 leading-relaxed">{selectedPet.allergies}</p>
                                                                        </div>
                                                                    )}
                                                                    <div className="col-span-1 md:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ghi chú sức khỏe dài hạn</p>
                                                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                                                                            {selectedPet.healthNote || 'Không có ghi chú bệnh lý đặc biệt hoặc mãn tính.'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {activePetSubTab === 'medical' && (
                                                                <div className="space-y-6">
                                                                    {/* Vaccines */}
                                                                    <div>
                                                                        <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Lịch sử tiêm ngừa</h6>
                                                                        {selectedPet.vaccinations && selectedPet.vaccinations.length > 0 ? (
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                {selectedPet.vaccinations.map((vac, idx) => (
                                                                                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl flex justify-between items-center gap-3">
                                                                                        <div>
                                                                                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">{vac.name}</p>
                                                                                            <p className="text-[10px] text-slate-400 font-bold">{vac.drug} • {format(new Date(vac.date), 'dd/MM/yyyy')}</p>
                                                                                        </div>
                                                                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shrink-0 ${
                                                                                            vac.status === 'done' ? 'bg-emerald-55 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-indigo-55 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
                                                                                        }`}>
                                                                                            {vac.status === 'done' ? 'Đã tiêm' : 'Sắp tiêm'}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-xs font-bold text-slate-400 italic bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl text-center">Chưa có lịch sử tiêm ngừa</p>
                                                                        )}
                                                                    </div>

                                                                    {/* Medical records */}
                                                                    <div>
                                                                        <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Bệnh án trước đây</h6>
                                                                        {selectedPet.medicalRecords && selectedPet.medicalRecords.length > 0 ? (
                                                                            <div className="space-y-3">
                                                                                {selectedPet.medicalRecords.map((rec, idx) => (
                                                                                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2">
                                                                                        <div className="flex justify-between items-start gap-4">
                                                                                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">{rec.diagnosis}</p>
                                                                                            <span className="text-[9px] font-bold text-slate-400 shrink-0">{format(new Date(rec.visitDate), 'dd/MM/yyyy')}</span>
                                                                                        </div>
                                                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                                                                                            <p><span className="font-bold">Điều trị:</span> {rec.treatment || 'N/A'}</p>
                                                                                            <p><span className="font-bold">Đơn thuốc:</span> {rec.prescription || 'N/A'}</p>
                                                                                        </div>
                                                                                        {rec.veterinarianNote && (
                                                                                            <p className="text-[10px] text-slate-500 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                                                Lưu ý: {rec.veterinarianNote}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-xs font-bold text-slate-400 italic bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl text-center">Chưa ghi nhận bệnh án trước đó</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {activePetSubTab === 'nutrition' && (
                                                                <div>
                                                                    <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">Khẩu phần ăn hiện tại</h6>
                                                                    {selectedPet.nutritionPlan && selectedPet.nutritionPlan.length > 0 ? (
                                                                        <div className="space-y-3">
                                                                            {selectedPet.nutritionPlan.map((plan, idx) => (
                                                                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-500 dark:text-orange-400 flex items-center justify-center text-xs font-black">
                                                                                            🍽️
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">{plan.mealName}</p>
                                                                                            <p className="text-[10px] text-slate-400 font-bold">{plan.foodType || 'Không chỉ định'}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <span className="text-xs font-black bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3.5 py-1.5 rounded-xl shadow-sm text-slate-700 dark:text-slate-300">
                                                                                        Lượng: {plan.amount || 'Không chỉ định'}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-xs font-bold text-slate-400 italic bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl text-center">Không có chế độ ăn kiêng hoặc khẩu phần ăn được chỉ định cụ thể</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="space-y-6">
                                                    {/* Form to add log if in progress */}
                                                    {selectedTask.status === 'IN_PROGRESS' ? (
                                                        <div className="bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <Plus size={16} className="text-indigo-600" />
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Thêm nhật ký hoạt động mới</span>
                                                            </div>
                                                            <form onSubmit={handleAddCareLog} className="space-y-4">
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                                    {CARE_LOG_TYPES.map(type => (
                                                                        <button
                                                                            key={type.id}
                                                                            type="button"
                                                                            onClick={() => setCareLogType(type.id)}
                                                                            className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border text-center transition-all ${
                                                                                careLogType === type.id 
                                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-indigo-100'
                                                                            }`}
                                                                        >
                                                                            <type.icon size={16} />
                                                                            <span className="text-[8px] font-black uppercase tracking-wider">{type.label}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                
                                                                <div className="relative">
                                                                    <textarea 
                                                                        value={careLogNote}
                                                                        onChange={(e) => setCareLogNote(e.target.value)}
                                                                        placeholder="Nhập ghi chú chăm sóc chi tiết..."
                                                                        rows={3}
                                                                        className="w-full pl-4 pr-24 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none font-medium text-slate-750 dark:text-slate-200"
                                                                    />
                                                                    {careLogImage && (
                                                                        <div className="absolute top-3 right-3 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded truncate max-w-[100px]">
                                                                            Đã đính kèm ảnh
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                                                        <input 
                                                                            type="file" 
                                                                            accept="image/*"
                                                                            id="care-log-image"
                                                                            className="hidden"
                                                                            onChange={(e) => {
                                                                                if (e.target.files && e.target.files.length > 0) {
                                                                                    setCareLogImage(e.target.files[0]);
                                                                                }
                                                                            }}
                                                                        />
                                                                        <label 
                                                                            htmlFor="care-log-image"
                                                                            className="cursor-pointer p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                                                        >
                                                                            <ImageIcon size={16} />
                                                                        </label>
                                                                        <button 
                                                                            type="submit"
                                                                            disabled={submittingLog || (!careLogNote.trim() && !careLogImage)}
                                                                            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all disabled:opacity-50"
                                                                        >
                                                                            {submittingLog ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/20 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                                                            <Info size={16} />
                                                            Chỉ ghi nhận nhật ký chăm sóc khi booking đang được "Thực hiện".
                                                        </div>
                                                    )}

                                                    {/* Care Logs timeline */}
                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tiến độ nhật ký chăm sóc</p>
                                                        
                                                        {loadingLogs ? (
                                                            <div className="flex justify-center py-10">
                                                                <Loader2 size={24} className="animate-spin text-indigo-600" />
                                                            </div>
                                                        ) : careLogs.length > 0 ? (
                                                            <div className="space-y-4 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                                                                {careLogs.map((log) => {
                                                                    const typeCfg = CARE_LOG_TYPES.find(t => t.id === log.type) || CARE_LOG_TYPES[0];
                                                                    return (
                                                                        <div key={log.id} className="relative pl-12">
                                                                            <div className={`absolute left-1.5 top-1 w-7 h-7 rounded-lg ${typeCfg.color} flex items-center justify-center z-10 shadow-sm border border-white dark:border-slate-900 text-xs`}>
                                                                                <typeCfg.icon size={12} />
                                                                            </div>
                                                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{typeCfg.label}</span>
                                                                                    <span className="text-[8px] font-bold text-slate-400">{format(parseISO(log.timestamp), 'HH:mm - dd/MM')}</span>
                                                                                </div>
                                                                                <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold">{log.note}</p>
                                                                                <p className="text-[9px] text-slate-400 font-bold italic pt-1 border-t border-slate-100 dark:border-slate-800/50">Người thực hiện: {log.staffName}</p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs font-bold text-slate-400 italic bg-slate-50 dark:bg-slate-800/20 p-6 rounded-2xl text-center">Chưa có nhật ký hoạt động cho ca trực này.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {activeRightTab === 'medical' && (
                                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                                                            <Syringe className="text-emerald-600 dark:text-emerald-400" size={20} />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-lg font-black text-slate-900 dark:text-white">Cập nhật hồ sơ y tế</h5>
                                                            <p className="text-xs font-bold text-slate-400">Điền thông tin khám chữa bệnh cho thú cưng</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {selectedTask.status === 'IN_PROGRESS' ? (
                                                        <form onSubmit={handleAddMedicalRecord} className="space-y-4 p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                            <div>
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Chẩn đoán</label>
                                                                <input 
                                                                    value={medicalForm.diagnosis} 
                                                                    onChange={e => setMedicalForm({...medicalForm, diagnosis: e.target.value})}
                                                                    placeholder="VD: Viêm đường ruột, Cảm cúm..."
                                                                    className="w-full bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-white outline-none border border-slate-200 dark:border-slate-600 focus:border-emerald-500 rounded-xl px-4 py-3"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Triệu chứng</label>
                                                                <input 
                                                                    value={medicalForm.symptoms} 
                                                                    onChange={e => setMedicalForm({...medicalForm, symptoms: e.target.value})}
                                                                    placeholder="Mô tả triệu chứng..."
                                                                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 outline-none border border-slate-200 dark:border-slate-600 focus:border-emerald-500 rounded-xl px-4 py-3"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Điều trị</label>
                                                                    <input 
                                                                        value={medicalForm.treatment} 
                                                                        onChange={e => setMedicalForm({...medicalForm, treatment: e.target.value})}
                                                                        placeholder="Phương pháp điều trị..."
                                                                        className="w-full bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 outline-none border border-slate-200 dark:border-slate-600 focus:border-emerald-500 rounded-xl px-4 py-3"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Đơn thuốc</label>
                                                                    <input 
                                                                        value={medicalForm.prescription} 
                                                                        onChange={e => setMedicalForm({...medicalForm, prescription: e.target.value})}
                                                                        placeholder="Danh sách thuốc..."
                                                                        className="w-full bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 outline-none border border-slate-200 dark:border-slate-600 focus:border-emerald-500 rounded-xl px-4 py-3"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ghi chú thêm</label>
                                                                <textarea 
                                                                    value={medicalForm.notes || ''} 
                                                                    onChange={e => setMedicalForm({...medicalForm, notes: e.target.value})}
                                                                    rows={3}
                                                                    placeholder="Lưu ý dặn dò khách hàng..."
                                                                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 outline-none border border-slate-200 dark:border-slate-600 focus:border-emerald-500 rounded-xl px-4 py-3 resize-none"
                                                                />
                                                            </div>
                                                            <div className="flex justify-end pt-2">
                                                                <button 
                                                                    type="submit"
                                                                    disabled={submittingMedical}
                                                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-900/15 transition-all flex items-center gap-2 disabled:opacity-50"
                                                                >
                                                                    {submittingMedical ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                                    Lưu Hồ Sơ Y Tế
                                                                </button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/20 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                                                            <Info size={16} />
                                                            Chỉ ghi nhận hồ sơ y tế khi booking đang được "Thực hiện".
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 z-[40]">
                                <button 
                                    onClick={() => setSelectedTask(null)}
                                    className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-white text-xs font-black uppercase tracking-wider transition-all"
                                >
                                    Đóng
                                </button>
                                
                                {selectedTask.status === 'CONFIRMED' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(selectedTask.bookingId, 'IN_PROGRESS')}
                                        disabled={updatingId === selectedTask.bookingId}
                                        className="px-6 py-3 bg-[#1a2b4c] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-900/15 hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {updatingId === selectedTask.bookingId ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} 
                                        Bắt đầu ca trực
                                    </button>
                                )}
                                
                                {selectedTask.status === 'IN_PROGRESS' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(selectedTask.bookingId, 'COMPLETED')}
                                        disabled={updatingId === selectedTask.bookingId}
                                        className="px-6 py-3 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-green-500/15 hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {updatingId === selectedTask.bookingId ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} 
                                        Hoàn thành
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

