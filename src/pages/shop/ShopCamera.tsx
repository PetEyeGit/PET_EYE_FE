import React, { useState } from 'react';
import { Video, Maximize2, Volume2, VolumeX, Grid3x3, Play, Plus, Trash2, X, Save, Send, MessageCircle, User, Utensils, Droplets, Activity, Heart, Clock, CheckCircle, ClipboardList, Monitor, Settings, Wifi, Cpu, ChevronRight, ChevronLeft, Image as ImageIcon } from 'lucide-react';

interface Camera {
  id: string;
  roomName: string;
  petName: string;
  petOwner: string;
  status: 'live' | 'offline';
  thumbnail: string;
  checkInDate: string;
  checkOutDate: string;
  ipAddress?: string;
  username?: string;
  password?: string;
}

interface ChatMessage {
  id: string;
  sender: 'shop' | 'customer';
  text: string;
  time: string;
}

interface CareLog {
  id: string;
  time: string;
  action: string;
  desc: string;
  icon: string;
  color: string;
}

const CAMERAS: Camera[] = [
  {
    id: 'CAM-001',
    roomName: 'Phòng VIP - Tầng 2',
    petName: 'Miu Miu',
    petOwner: 'Nguyễn Văn A',
    status: 'live',
    thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80',
    checkInDate: '04/03/2026',
    checkOutDate: '10/03/2026',
    ipAddress: '192.168.1.101',
    username: 'admin',
    password: '********',
  },
  {
    id: 'CAM-002',
    roomName: 'Phòng Standard - Tầng 1',
    petName: 'Buddy',
    petOwner: 'Trần Thị B',
    status: 'live',
    thumbnail: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
    checkInDate: '05/03/2026',
    checkOutDate: '08/03/2026',
    ipAddress: '192.168.1.102',
    username: 'admin',
    password: '********',
  },
  {
    id: 'CAM-003',
    roomName: 'Phòng VIP - Tầng 3',
    petName: 'Luna',
    petOwner: 'Lê Minh C',
    status: 'live',
    thumbnail: 'https://images.unsplash.com/photo-1573865526739-10c1dd7e1e0d?w=400&q=80',
    checkInDate: '03/03/2026',
    checkOutDate: '12/03/2026',
    ipAddress: '192.168.1.103',
    username: 'admin',
    password: '********',
  },
  {
    id: 'CAM-004',
    roomName: 'Phòng Standard - Tầng 1',
    petName: 'Max',
    petOwner: 'Phạm Thu D',
    status: 'offline',
    thumbnail: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80',
    checkInDate: '02/03/2026',
    checkOutDate: '05/03/2026',
    ipAddress: '192.168.1.104',
    username: 'admin',
    password: '********',
  },
];

const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'CAM-001': [
    { id: '1', sender: 'customer', text: 'Chào shop! Bé Miu Miu hôm nay thế nào rồi ạ?', time: '09:00' },
    { id: '2', sender: 'shop', text: 'Dạ chào bạn, bé Miu Miu hôm nay rất ngoan, ăn hết suất và đang ngủ trưa ạ.', time: '09:05' },
    { id: '3', sender: 'customer', text: 'Cảm ơn shop nhiều nhé!', time: '10:30' },
  ],
  'CAM-002': [
    { id: '1', sender: 'customer', text: 'Shop ơi Buddy có quậy không ạ?', time: '08:30' },
    { id: '2', sender: 'shop', text: 'Dạ bé Buddy rất hiếu động, đang chơi đùa với các bạn khác ạ.', time: '08:45' },
  ],
};

const INITIAL_CARE_LOGS: Record<string, CareLog[]> = {
  'CAM-001': [
    { id: '1', time: '10:30 SA', action: 'Cho ăn', desc: 'Bé đã ăn hết 50g hạt Royal Canin Indoor.', icon: 'utensils', color: '#f97316' },
    { id: '2', time: '09:15 SA', action: 'Vệ sinh', desc: 'Đã dọn dẹp khay vệ sinh và thay cát mới.', icon: 'droplets', color: '#00b4d8' },
    { id: '3', time: '08:00 SA', action: 'Kiểm tra sức khoẻ', desc: 'Nhiệt độ 38.5°C – ổn định. Bé rất lanh lợi.', icon: 'activity', color: '#00b4d8' },
  ],
  'CAM-002': [
    { id: '1', time: '11:00 SA', action: 'Vận động', desc: 'Chơi đùa với bóng tennis trong 20 phút.', icon: 'heart', color: '#ec4899' },
  ]
};

function LogIcon({ type, color }: { type: string; color: string }) {
  const cls = `w-4 h-4`;
  const style = { color };
  if (type === 'utensils') return <Utensils className={cls} style={style} />;
  if (type === 'droplets') return <Droplets className={cls} style={style} />;
  if (type === 'activity') return <Activity className={cls} style={style} />;
  return <Heart className={cls} style={style} />;
}

export default function ShopCamera() {
  const [cameras, setCameras] = useState<Camera[]>(CAMERAS);
  const [selectedCamera, setSelectedCamera] = useState<Camera>(CAMERAS[0]);
  const [isMuted, setIsMuted] = useState(true);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    roomName: '',
    ipAddress: '',
    username: '',
    password: '',
    petName: '',
    petOwner: '',
    resolution: '1080p',
    thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
    type: 'indoor',
  });
  const [modalStep, setModalStep] = useState(1);

  const [activeTab, setActiveTab] = useState<'list' | 'logs' | 'chat'>('list');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);
  const [careLogs, setCareLogs] = useState<Record<string, CareLog[]>>(INITIAL_CARE_LOGS);
  const [newMessage, setNewMessage] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [newLog, setNewLog] = useState({
    action: '',
    desc: '',
    type: 'utensils'
  });

  const handleAddLog = () => {
    if (!newLog.action || !newLog.desc) return;
    
    const colors: Record<string, string> = {
        utensils: '#f97316',
        droplets: '#00b4d8',
        activity: '#00b4d8',
        heart: '#ec4899'
    };

    const log: CareLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + (new Date().getHours() < 12 ? 'SA' : 'CH'),
      action: newLog.action,
      desc: newLog.desc,
      icon: newLog.type,
      color: colors[newLog.type] || '#f97316'
    };

    setCareLogs(prev => ({
      ...prev,
      [selectedCamera.id]: [log, ...(prev[selectedCamera.id] || [])]
    }));
    setShowLogModal(false);
    setNewLog({ action: '', desc: '', type: 'utensils' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'shop',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedCamera.id]: [...(prev[selectedCamera.id] || []), msg]
    }));
    setNewMessage('');

    // Simulate customer reply
    setTimeout(() => {
        const reply: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'customer',
            text: 'Dạ em cảm ơn shop ạ! ❤️',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages(prev => ({
            ...prev,
            [selectedCamera.id]: [...(prev[selectedCamera.id] || []), reply]
        }));
    }, 3000);
  };

  const handleAddCamera = () => {
    const newCamera: Camera = {
      id: `CAM-${String(cameras.length + 1).padStart(3, '0')}`,
      roomName: formData.roomName,
      petName: formData.petName || 'Chưa có thú cưng',
      petOwner: formData.petOwner || 'Chưa có chủ',
      status: 'offline',
      thumbnail: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&q=80',
      checkInDate: new Date().toLocaleDateString('vi-VN'),
      checkOutDate: '-',
      ipAddress: formData.ipAddress,
      username: formData.username,
      password: formData.password,
    };
    setCameras([...cameras, newCamera]);
    setShowAddModal(false);
    setFormData({
      roomName: '',
      ipAddress: '',
      username: '',
      password: '',
      petName: '',
      petOwner: '',
    });
  };

  const handleDeleteCamera = (cameraId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa camera này?')) {
      setCameras(cameras.filter(cam => cam.id !== cameraId));
      if (selectedCamera.id === cameraId && cameras.length > 1) {
        setSelectedCamera(cameras[0].id === cameraId ? cameras[1] : cameras[0]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-screen-2xl mx-auto px-5 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quản lý Camera</h1>
            <p className="text-slate-600 dark:text-slate-400">Theo dõi thú cưng đang lưu trú tại cơ sở</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Thêm camera</span>
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'single' ? 'grid' : 'single')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Grid3x3 size={18} />
              <span className="hidden sm:inline">{viewMode === 'single' ? 'Xem lưới' : 'Xem đơn'}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng camera', value: '12', icon: '📹', color: 'from-blue-500 to-blue-600' },
            { label: 'Đang hoạt động', value: '8', icon: '🟢', color: 'from-green-500 to-green-600' },
            { label: 'Thú cưng lưu trú', value: '8', icon: '🐾', color: 'from-purple-500 to-purple-600' },
            { label: 'Offline', value: '4', icon: '⚫', color: 'from-slate-500 to-slate-600' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} opacity-10`} />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {viewMode === 'single' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            {/* Main Camera View */}
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-2xl overflow-hidden relative aspect-video shadow-2xl">
                <img
                  src={selectedCamera.thumbnail}
                  alt={selectedCamera.petName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
                
                {/* Live Badge */}
                {selectedCamera.status === 'live' && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                )}

                {/* Camera Info */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="text-white">
                    <p className="text-sm opacity-80">{selectedCamera.id} - {selectedCamera.roomName}</p>
                    <h3 className="text-2xl font-bold">{selectedCamera.petName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                      {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
                    </button>
                    <button className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                      <Maximize2 size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pet Info Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                    <img
                      src={selectedCamera.thumbnail}
                      className="w-full h-full object-cover"
                      alt={selectedCamera.petName}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCamera.petName}</h3>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-full border border-teal-100 dark:border-teal-800">
                        AN TOÀN
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Chủ nuôi: {selectedCamera.petOwner}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Ngày nhận</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedCamera.checkInDate}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Ngày trả</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedCamera.checkOutDate}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Phòng</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedCamera.roomName}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Camera ID</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedCamera.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Camera List, Logs & Chat Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-fit lg:h-[700px]">
              <div className="flex border-b border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === 'list'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Danh sách
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'logs'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <ClipboardList size={14} />
                  Nhật ký
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'chat'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <MessageCircle size={14} />
                  Trò chuyện
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                {activeTab === 'list' ? (
                  <div className="p-4 space-y-3 overflow-y-auto">
                    {cameras.map((camera) => (
                      <div
                        key={camera.id}
                        className={`relative group rounded-xl transition-all ${
                          selectedCamera.id === camera.id
                            ? 'bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white shadow-lg'
                            : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setSelectedCamera(camera);
                            // Keep tab same or switch if needed
                          }}
                          className="w-full text-left p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                              <img src={camera.thumbnail} alt={camera.petName} className="w-full h-full object-cover" />
                              {camera.status === 'live' && (
                                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-bold text-sm truncate ${selectedCamera.id === camera.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                {camera.petName}
                              </p>
                              <p className={`text-xs truncate ${selectedCamera.id === camera.id ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                {camera.roomName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  camera.status === 'live'
                                    ? selectedCamera.id === camera.id ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    : selectedCamera.id === camera.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                }`}>
                                  {camera.status === 'live' ? 'Live' : 'Offline'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCamera(camera.id);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : activeTab === 'logs' ? (
                  <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian biểu hôm nay</h4>
                        <button 
                            onClick={() => setShowLogModal(true)}
                            className="p-1.5 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-5 space-y-0 relative">
                        {(careLogs[selectedCamera.id] || []).map((log, i, arr) => (
                            <div key={log.id} className="flex gap-4 py-3 relative group">
                                <div className="flex flex-col items-center gap-1 pt-1">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 z-10 group-hover:scale-110 transition-transform shadow-sm">
                                        <LogIcon type={log.icon} color={log.color} />
                                    </div>
                                    {i < arr.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 absolute top-9 bottom-[-10px] left-[15px]" />}
                                </div>
                                <div className="flex-1 min-w-0 pb-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{log.action}</span>
                                        <span className="text-[10px] font-semibold text-slate-400 shrink-0 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">{log.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{log.desc}</p>
                                </div>
                            </div>
                        ))}
                        {(!careLogs[selectedCamera.id] || careLogs[selectedCamera.id].length === 0) && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
                                <ClipboardList size={40} className="mb-3" />
                                <p className="text-sm font-medium">Chưa có nhật ký cho ngày hôm nay</p>
                            </div>
                        )}
                        
                        {/* Summary banner */}
                        {careLogs[selectedCamera.id]?.length > 0 && (
                            <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-2xl p-4 mt-6">
                                <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                </div>
                                <p className="text-[10px] text-teal-700 dark:text-teal-300 font-bold leading-tight">Mọi chỉ số của {selectedCamera.petName} đều ổn định trong hôm nay.</p>
                            </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                      {(chatMessages[selectedCamera.id] || []).map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'shop' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'shop' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold shadow-sm ${msg.sender === 'shop' ? 'bg-[#1a2b4c] text-white' : 'bg-white text-[#1a2b4c] border border-slate-200'}`}>
                              {msg.sender === 'shop' ? 'S' : (selectedCamera.petOwner.charAt(0) || 'U')}
                            </div>
                            <div className={`flex flex-col ${msg.sender === 'shop' ? 'items-end' : 'items-start'}`}>
                              <p className="text-[10px] font-bold text-slate-500 mb-1">
                                {msg.sender === 'shop' ? 'Bạn (Shop)' : selectedCamera.petOwner}
                              </p>
                              <div
                                className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                  msg.sender === 'shop'
                                    ? 'bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white rounded-tr-sm'
                                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <p className="text-[9px] text-slate-400 mt-1">{msg.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!chatMessages[selectedCamera.id] || chatMessages[selectedCamera.id].length === 0) && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Chưa có tin nhắn nào với chủ của {selectedCamera.petName}</p>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Nhắn tin cho khách hàng..."
                          className="flex-1 bg-transparent text-sm px-2 py-1 outline-none text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="w-10 h-10 bg-[#1a2b4c] text-white rounded-lg flex items-center justify-center hover:bg-slate-700 transition-all disabled:opacity-50"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cameras.map((camera) => (
              <div
                key={camera.id}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group relative"
              >
                <div
                  className="relative aspect-video bg-slate-900 cursor-pointer"
                  onClick={() => {
                    setSelectedCamera(camera);
                    setViewMode('single');
                  }}
                >
                  <img src={camera.thumbnail} alt={camera.petName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {camera.status === 'live' && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCamera(camera.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-sm">{camera.petName}</p>
                    <p className="text-white/80 text-xs">{camera.roomName}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Chủ nuôi: {camera.petOwner}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {camera.checkInDate} - {camera.checkOutDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row h-[600px] md:h-auto">
            
            {/* Sidebar with Steps */}
            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/50 p-8 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 bg-[#1a2b4c] text-white rounded-xl flex items-center justify-center shadow-lg">
                      <Plus size={20} />
                  </div>
                  <div>
                      <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Thêm Camera</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thiết lập mới</p>
                  </div>
               </div>

               <div className="space-y-6">
                  {[
                    { step: 1, label: 'Kết nối phần cứng', icon: <Cpu size={18} /> },
                    { step: 2, label: 'Thông tin hiển thị', icon: <Monitor size={18} /> },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center gap-4 group">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            modalStep === s.step 
                                ? 'bg-[#1a2b4c] text-white shadow-md' 
                                : modalStep > s.step 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-white dark:bg-slate-800 text-slate-400'
                        }`}>
                            {modalStep > s.step ? <CheckCircle size={16} /> : s.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bước {s.step}</p>
                            <p className={`text-xs font-bold ${modalStep === s.step ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{s.label}</p>
                        </div>
                    </div>
                  ))}
               </div>

               <div className="mt-auto pt-10 border-t border-slate-100 dark:border-slate-700 hidden md:block">
                    <p className="text-[10px] text-slate-400 italic">Lưu ý: Camera cần được kết nối cùng lớp mạng với hệ thống Peteye.</p>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                {modalStep === 1 ? '🔑 Thiết lập kết nối' : '🐾 Thông tin Camera'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {modalStep === 1 ? 'Nhập thông tin IP và tài khoản quản trị của camera.' : 'Cấu hình tên hiển thị và gán cho thú cưng.'}
                            </p>
                        </div>
                        <button 
                            onClick={() => {
                                setShowAddModal(false);
                                setModalStep(1);
                            }}
                            className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {modalStep === 1 ? (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Địa chỉ IP *</label>
                                        <div className="relative">
                                            <Wifi size={16} className="absolute left-3 top-3 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.ipAddress}
                                                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                                                placeholder="192.168.1.100"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Độ phân giải</label>
                                        <select
                                            value={formData.resolution}
                                            onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm appearance-none"
                                        >
                                            <option value="720p">720p (HD)</option>
                                            <option value="1080p">1080p (Full HD)</option>
                                            <option value="2k">2K (Quad HD)</option>
                                            <option value="4k">4K (Ultra HD)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Username *</label>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="admin"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password *</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-teal-50 dark:bg-teal-900/10 rounded-2xl border border-teal-100 dark:border-teal-900 flex items-start gap-3 mt-4">
                                    <Settings size={18} className="text-teal-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-teal-800 dark:text-teal-400">Kiểm tra kết nối</h4>
                                        <p className="text-[10px] text-teal-600/70 mt-1">Hệ thống sẽ tự động xác thực thông tin tài khoản qua địa chỉ IP đã nhập.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tên phòng *</label>
                                    <input
                                        type="text"
                                        value={formData.roomName}
                                        onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                                        placeholder="Ví dụ: Phòng Deluxe #01"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tên thú cưng</label>
                                        <input
                                            type="text"
                                            value={formData.petName}
                                            onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                                            placeholder="Gâu Gâu"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Chủ nuôi</label>
                                        <input
                                            type="text"
                                            value={formData.petOwner}
                                            onChange={(e) => setFormData({ ...formData, petOwner: e.target.value })}
                                            placeholder="Nguyễn Văn A"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Ảnh đại diện camera (Thumbnail URL)</label>
                                    <div className="relative">
                                        <ImageIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.thumbnail}
                                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                            placeholder="URL hình ảnh quan sát..."
                                        />
                                    </div>
                                    <div className="mt-2 h-32 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 relative">
                                        <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded">PREVIEW</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20 flex gap-3">
                    {modalStep === 2 && (
                        <button
                            onClick={() => setModalStep(1)}
                            className="flex items-center gap-2 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-white transition-all text-sm"
                        >
                            <ChevronLeft size={18} />
                            Quay lại
                        </button>
                    )}
                    
                    <div className="flex-1" />

                    <button
                        onClick={() => {
                            setShowAddModal(false);
                            setModalStep(1);
                        }}
                        className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 text-sm"
                    >
                        Hủy
                    </button>

                    {modalStep === 1 ? (
                        <button
                            onClick={() => setModalStep(2)}
                            disabled={!formData.ipAddress || !formData.username || !formData.password}
                            className="flex items-center gap-2 px-8 py-3 bg-[#1a2b4c] text-white rounded-2xl font-bold hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-sm"
                        >
                            Tiếp theo
                            <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleAddCamera}
                            disabled={!formData.roomName}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl font-bold hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-sm"
                        >
                            <Save size={18} />
                            Kích hoạt Camera
                        </button>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
      {/* Add Care Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tạo nhật ký mới</h2>
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Loại hoạt động</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'utensils', icon: <Utensils size={18} />, color: 'text-orange-500' },
                    { id: 'droplets', icon: <Droplets size={18} />, color: 'text-blue-500' },
                    { id: 'activity', icon: <Activity size={18} />, color: 'text-teal-500' },
                    { id: 'heart', icon: <Heart size={18} />, color: 'text-pink-500' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setNewLog({ ...newLog, type: t.id })}
                      className={`h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                        newLog.type === t.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className={t.color}>{t.icon}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tiêu đề</label>
                <input
                  type="text"
                  value={newLog.action}
                  onChange={(e) => setNewLog({ ...newLog, action: e.target.value })}
                  placeholder="Ví dụ: Cho ăn trưa"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chi tiết</label>
                <textarea
                  value={newLog.desc}
                  onChange={(e) => setNewLog({ ...newLog, desc: e.target.value })}
                  placeholder="Nhập nội dung nhật ký..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm min-h-[100px] resize-none"
                />
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-700/30 flex gap-3">
              <button
                onClick={() => setShowLogModal(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={handleAddLog}
                disabled={!newLog.action || !newLog.desc}
                className="flex-[2] py-3 bg-[#1a2b4c] text-white rounded-xl text-sm font-bold hover:shadow-lg disabled:opacity-50 transition-all"
              >
                Lưu nhật ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
