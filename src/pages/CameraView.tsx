import React, { useState, useEffect, useRef } from 'react';
import {
    Video, Camera, Maximize2, Minimize2, Volume2, VolumeX,
    ShieldCheck, Activity, Clock, Heart, Send, MessageCircle,
    Download, RefreshCw, Wifi, WifiOff, Settings, ChevronRight,
    Thermometer, Utensils, Droplets, AlertCircle, CheckCircle,
    LayoutGrid, Monitor, ArrowLeft, Bell, BellOff, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── DATA ─────────────────────────────────────────────────────────────── */

const CAMERAS = [
    {
        id: 'cam01',
        label: 'CAM 01 – Phòng Lưu Trú VIP',
        pet: 'Miu Miu',
        area: 'Khu VIP – Tầng 2',
        img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop',
        status: 'online',
    },
    {
        id: 'cam02',
        label: 'CAM 02 – Khu Vui Chơi',
        pet: 'Miu Miu',
        area: 'Sân Chơi – Tầng 1',
        img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=2070&auto=format&fit=crop',
        status: 'online',
    },
    {
        id: 'cam03',
        label: 'CAM 03 – Phòng Ăn',
        pet: 'Miu Miu',
        area: 'Nhà Bếp – Tầng 1',
        img: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1974&auto=format&fit=crop',
        status: 'online',
    },
    {
        id: 'cam04',
        label: 'CAM 04 – Khu Spa',
        pet: 'Miu Miu',
        area: 'Spa & Grooming',
        img: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?q=80&w=2069&auto=format&fit=crop',
        status: 'offline',
    },
];

const CARE_LOGS = [
    { time: '10:30 SA', action: 'Cho ăn', desc: 'Bé đã ăn hết 50g hạt Royal Canin Indoor.', icon: 'utensils', color: '#f97316' },
    { time: '09:15 SA', action: 'Vệ sinh', desc: 'Đã dọn dẹp khay vệ sinh và thay cát mới.', icon: 'droplets', color: '#00b4d8' },
    { time: '08:00 SA', action: 'Kiểm tra sức khoẻ', desc: 'Nhiệt độ 38.5°C – ổn định. Bé rất lanh lợi.', icon: 'activity', color: '#00b4d8' },
    { time: 'Hôm qua', action: 'Vận động', desc: 'Chơi đùa với cần câu mèo trong 25 phút.', icon: 'heart', color: '#ec4899' },
    { time: 'Hôm qua', action: 'Uống nước', desc: 'Bổ sung nước đầy đủ – 200ml.', icon: 'droplets', color: '#00b4d8' },
];

const CHAT_MESSAGES: Record<string, any[]> = {
    'cam01': [
        { from: 'staff', name: 'Nhân viên Lan', text: 'Chào bạn! Bé Miu Miu đang rất vui và khoẻ. 🐾', time: '10:32 SA' },
        { from: 'me', name: 'Bạn', text: 'Cảm ơn bạn! Bé có ăn đủ bữa không?', time: '10:35 SA' },
    ],
    'cam02': [
        { from: 'staff', name: 'Nhân viên Lan', text: 'Chào bạn! Bé Miu Miu đang chơi ở khu vui chơi nhé.', time: '09:15 SA' },
    ],
};

/* ─── ICON HELPER ────────────────────────────────────────────────────────── */
function LogIcon({ type, color }: { type: string; color: string }) {
    const cls = `w-4 h-4`;
    const style = { color };
    if (type === 'utensils') return <Utensils className={cls} style={style} />;
    if (type === 'droplets') return <Droplets className={cls} style={style} />;
    if (type === 'activity') return <Activity className={cls} style={style} />;
    return <Heart className={cls} style={style} />;
}

/* ─── CAMERA CELL ──────────────────────────────────────────────────────── */
interface CamCellProps {
    cam: typeof CAMERAS[0];
    isMain?: boolean;
    isSelected?: boolean;
    onClick?: () => void;
}

function CamCell({ cam, isMain, isSelected, onClick }: CamCellProps) {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const ts = time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const online = cam.status === 'online';

    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden w-full h-full cursor-pointer group
        ${isSelected ? 'ring-2 ring-secondary shadow-md' : 'ring-1 ring-slate-200 hover:ring-secondary/50'}
        bg-white rounded-2xl transition-all duration-300`}
        >
            {online ? (
                <>
                    <img
                        src={cam.img}
                        alt={cam.label}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Light gradient for readable text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/30" />
                </>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50">
                    <WifiOff className="w-8 h-8 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500">Mất kết nối</p>
                </div>
            )}

            {/* Top-left: LIVE badge + cam label */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                {online ? (
                    <span className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                    </span>
                ) : (
                    <span className="flex items-center gap-1 bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full">
                        OFFLINE
                    </span>
                )}
                {isMain && (
                    <span className="text-[10px] font-semibold text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                        {cam.label}
                    </span>
                )}
            </div>

            {/* Top-right: timestamp */}
            {online && (
                <div className="absolute top-3 right-3 z-10 font-mono text-[10px] font-medium text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                    {ts}
                </div>
            )}

            {/* Bottom: area label */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
                <div>
                    {!isMain && (
                        <p className="text-[10px] font-semibold text-white leading-tight truncate max-w-[120px]">{cam.label}</p>
                    )}
                    <p className="text-[9px] font-medium text-white/80">{cam.area}</p>
                </div>
                {isMain && online && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-white/90">
                        <Wifi className="w-3 h-3" /> HD
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── MAIN PAGE ────────────────────────────────────────────────────────── */
export default function CameraView() {
    const navigate = useNavigate();
    const [activeCam, setActiveCam] = useState(CAMERAS[0]);
    const [muted, setMuted] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [tab, setTab] = useState<'logs' | 'chat'>('logs');
    const [msg, setMsg] = useState('');
    const [chatMessages, setChatMessages] = useState<Record<string, any[]>>(CHAT_MESSAGES);
    const [layout, setLayout] = useState<'split' | 'main'>('split');
    const [currentTime, setCurrentTime] = useState(new Date());
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const id = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const sendMessage = () => {
        if (!msg.trim()) return;
        const newMsg = { 
            from: 'me', 
            name: 'Bạn', 
            text: msg.trim(), 
            time: currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + (currentTime.getHours() < 12 ? 'SA' : 'CH') 
        };
        
        setChatMessages(prev => ({
            ...prev,
            [activeCam.id]: [...(prev[activeCam.id] || []), newMsg]
        }));
        setMsg('');

        // Simulate staff reply after 2s
        setTimeout(() => {
            const reply = { 
                from: 'staff', 
                name: 'Nhân viên Lan', 
                text: 'Cảm ơn bạn! Chúng tôi đã nhận được thông tin. 🐾', 
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + (new Date().getHours() < 12 ? 'SA' : 'CH') 
            };
            setChatMessages(prev => ({
                ...prev,
                [activeCam.id]: [...(prev[activeCam.id] || []), reply]
            }));
        }, 2000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f5efe6] overflow-hidden text-primary">

            {/* ── HEADER ────────────────────────────────────────────────── */}
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-full hover:bg-slate-50 text-slate-500 hover:text-primary transition-colors border border-slate-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-primary leading-tight">Camera Giám Sát</h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Peteye PetCare · {CAMERAS.filter(c => c.status === 'online').length}/{CAMERAS.length} camera đang hoạt động</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Date+time */}
                    <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 font-medium bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                        <Clock className="w-4 h-4 text-secondary" />
                        {currentTime.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        <span className="text-slate-300">|</span>
                        <span className="text-primary font-bold">{currentTime.toLocaleTimeString('vi-VN')}</span>
                    </div>

                    {/* Layout toggle */}
                    <div className="flex items-center gap-1 bg-slate-50 rounded-full p-1 border border-slate-100">
                        <button
                            onClick={() => setLayout('main')}
                            className={`p-2 rounded-full transition-all ${layout === 'main' ? 'bg-white shadow-sm text-secondary' : 'text-slate-400 hover:text-primary'}`}
                            title="Chế độ tập trung"
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setLayout('split')}
                            className={`p-2 rounded-full transition-all ${layout === 'split' ? 'bg-white shadow-sm text-secondary' : 'text-slate-400 hover:text-primary'}`}
                            title="Chế độ lưới"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* ── BODY ──────────────────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden p-6 gap-6">

                {/* LEFT: Camera Area */}
                <main className={`flex flex-col gap-4 transition-all duration-500 ${fullscreen ? 'fixed inset-0 z-50 bg-primary p-6 gap-4' : 'flex-1'}`}>

                    {/* Main / Primary Camera */}
                    <div className={`relative overflow-hidden rounded-3xl shadow-soft border border-black/5 bg-primary transition-all duration-500 ${layout === 'split' ? 'flex-[3]' : 'flex-1'}`}>
                        {/* LIVE large camera */}
                        <div className="absolute inset-0">
                            {activeCam.status === 'online' ? (
                                <>
                                    <img
                                        key={activeCam.id}
                                        src={activeCam.img}
                                        className="w-full h-full object-cover transition-opacity duration-700"
                                        alt="Live feed"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/20" />
                                </>
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-4">
                                    <WifiOff className="w-14 h-14 text-slate-300" />
                                    <p className="text-slate-500 font-semibold text-lg">Camera đang ngoại tuyến</p>
                                </div>
                            )}
                        </div>

                        {/* Overlays – top left */}
                        <div className="absolute top-5 left-5 flex items-center gap-3 z-10">
                            <div className="flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-red-500/20">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />LIVE
                            </div>
                            <div className="bg-black/20 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/20 hidden sm:flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                {activeCam.label}
                            </div>
                        </div>

                        {/* Top right controls */}
                        <div className="absolute top-5 right-5 flex gap-2 z-10">
                            <button
                                onClick={() => setMuted(!muted)}
                                className="p-3 bg-black/20 backdrop-blur-md text-white rounded-full border border-white/20 hover:bg-black/40 transition-all"
                            >
                                {muted ? <VolumeX className="w-5 h-5 text-red-200" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => setFullscreen(!fullscreen)}
                                className="p-3 bg-black/20 backdrop-blur-md text-white rounded-full border border-white/20 hover:bg-black/40 transition-all"
                            >
                                {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Bottom: action bar */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex items-center justify-between">
                            <div className="text-sm font-semibold text-white/90">
                                <span className="font-mono bg-black/20 px-2 py-1 rounded-md">{currentTime.toLocaleTimeString('vi-VN')}</span>
                                <span className="mx-2">•</span>
                                <span>{activeCam.area}</span>
                            </div>
                        </div>

                        {/* Fullscreen close hint */}
                        {fullscreen && (
                            <button
                                onClick={() => setFullscreen(false)}
                                className="absolute top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white text-primary text-sm font-bold px-5 py-2.5 rounded-full shadow-xl hover:scale-105 transition-transform"
                            >
                                <Minimize2 className="w-4 h-4" /> Thoát toàn màn hình
                            </button>
                        )}
                    </div>

                    {/* Thumbnail row – only in split layout */}
                    {layout === 'split' && (
                        <div className="flex gap-4 h-40 shrink-0">
                            {CAMERAS.map(cam => (
                                <div key={cam.id} className="flex-1" onClick={() => setActiveCam(cam)}>
                                    <CamCell cam={cam} isSelected={activeCam.id === cam.id} />
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* RIGHT: Info Panel */}
                {!fullscreen && (
                    <aside className="w-[380px] xl:w-[420px] shrink-0 bg-white rounded-3xl shadow-soft border border-slate-100 flex flex-col hidden lg:flex overflow-hidden">
                        {/* Pet header */}
                        <div className="p-6 border-b border-slate-100 space-y-5 bg-gradient-to-b from-slate-50 to-white">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                                    <img
                                        src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop"
                                        className="w-full h-full object-cover"
                                        alt="Miu Miu"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold text-primary">Miu Miu</h2>
                                    <p className="text-xs font-semibold text-secondary uppercase tracking-wider flex items-center gap-1 mt-1">
                                        <ShieldCheck className="w-4 h-4" />
                                        Đang được chăm sóc
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                                        AN TOÀN
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">Ngày 2/3</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Nhịp tim', value: '115', unit: 'bpm', icon: <Activity className="w-4 h-4" />, color: 'text-rose-500', bg: 'bg-rose-50' },
                                    { label: 'Nhiệt độ', value: '38.5', unit: '°C', icon: <Thermometer className="w-4 h-4" />, color: 'text-orange-500', bg: 'bg-orange-50' },
                                    { label: 'Thời gian', value: '2', unit: 'ngày', icon: <Clock className="w-4 h-4" />, color: 'text-secondary', bg: 'bg-secondary/10' },
                                ].map(s => (
                                    <div key={s.label} className={`${s.bg} rounded-2xl p-3 border border-slate-100/50 flex flex-col items-center justify-center text-center gap-1`}>
                                        <div className={`${s.color} mb-1`}>
                                            {s.icon}
                                        </div>
                                        <p className="text-lg font-bold text-primary leading-none">
                                            {s.value}
                                        </p>
                                        <span className="text-[10px] font-medium text-slate-500">{s.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 shrink-0 p-2 gap-2 bg-slate-50">
                            {(['logs', 'chat'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${tab === t ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-primary'}`}
                                >
                                    {t === 'logs' ? 'Nhật ký' : 'Trò chuyện'}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">
                            {tab === 'logs' && (
                                <div className="p-5 space-y-0">
                                    {CARE_LOGS.map((log, i) => (
                                        <div key={i} className="flex gap-4 py-3 relative group">
                                            <div className="flex flex-col items-center gap-1 pt-1">
                                                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 z-10 group-hover:scale-110 transition-transform shadow-sm">
                                                    <LogIcon type={log.icon} color={log.color} />
                                                </div>
                                                {i < CARE_LOGS.length - 1 && <div className="w-px flex-1 bg-slate-100 absolute top-9 bottom-[-10px] left-[15px]" />}
                                            </div>
                                            <div className="flex-1 min-w-0 pb-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-bold text-primary">{log.action}</span>
                                                    <span className="text-[10px] font-semibold text-slate-400 shrink-0 bg-slate-50 px-2 py-0.5 rounded-full">{log.time}</span>
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.desc}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* All good banner */}
                                    <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-2xl p-4 mt-6">
                                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                                            <CheckCircle className="w-4 h-4 text-teal-600" />
                                        </div>
                                        <p className="text-xs text-teal-700 font-semibold leading-relaxed">Tuyệt vời! Mọi chỉ số của Miu Miu đều rất tốt trong ngày hôm nay.</p>
                                    </div>
                                </div>
                            )}

                            {tab === 'chat' && (
                                <div className="flex flex-col h-full bg-slate-50/50">
                                    <div className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-hide">
                                        {(chatMessages[activeCam.id] || []).map((m, i) => (
                                            <div key={i} className={`flex gap-3 ${m.from === 'me' ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold shadow-sm ${m.from === 'staff' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-primary text-white'}`}>
                                                    {m.name.charAt(0)}
                                                </div>
                                                <div className={`max-w-[75%] ${m.from === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                                                    <p className={`text-[10px] font-bold ${m.from === 'staff' ? 'text-secondary' : 'text-slate-500'}`}>{m.name}</p>
                                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${m.from === 'me' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white text-primary border border-slate-100 rounded-tl-sm'}`}>
                                                        {m.text}
                                                    </div>
                                                    <p className="text-[9px] font-medium text-slate-400">{m.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!chatMessages[activeCam.id] || chatMessages[activeCam.id].length === 0) && (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3">
                                                <MessageCircle className="w-12 h-12" />
                                                <p className="text-xs font-medium">Chưa có tin nhắn cho camera này</p>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Message box */}
                        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-200 p-1.5 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
                                <input
                                    className="flex-1 bg-transparent text-sm font-medium text-primary placeholder-slate-400 focus:outline-none px-3"
                                    placeholder={tab === 'chat' ? 'Nhắn tin cho nhân viên...' : 'Tìm kiếm nhật ký...'}
                                    value={msg}
                                    onChange={e => setMsg(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                />
                                <button
                                    onClick={sendMessage}
                                    className="w-10 h-10 flex items-center justify-center bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all shadow-md shadow-secondary/20"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
