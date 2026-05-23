import React, { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Video, Maximize2, Volume2, VolumeX, Grid3x3, Play, Plus, Trash2, X,
  Send, MessageCircle, Utensils, Droplets, Activity, Heart, CheckCircle,
  ClipboardList, Wifi, AlertCircle, RefreshCw, Link, Loader2
} from 'lucide-react';
import * as cameraService from '../../services/camera.service';
import type { CameraDevice, CameraStream } from '../../services/camera.service';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function LogIcon({ type, color }: { type: string; color: string }) {
  const cls = 'w-4 h-4';
  const style = { color };
  if (type === 'utensils') return <Utensils className={cls} style={style} />;
  if (type === 'droplets') return <Droplets className={cls} style={style} />;
  if (type === 'activity') return <Activity className={cls} style={style} />;
  return <Heart className={cls} style={style} />;
}

// ─── HLS Video Player ─────────────────────────────────────────────────────────

function HLSPlayer({
  streamUrl,
  isMuted,
  onError,
}: {
  streamUrl: string;
  isMuted: boolean;
  onError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef   = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error('[HLS] Fatal error:', data);
          onError();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => video.play().catch(() => {}));
    } else {
      onError();
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [streamUrl, onError]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      autoPlay
      playsInline
      muted={isMuted}
    />
  );
}

// ─── Bind Account Modal ───────────────────────────────────────────────────────

function BindAccountModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [phone, setPhone]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleBind = async () => {
    if (!phone.trim()) { setError('Vui lòng nhập số điện thoại'); return; }
    setLoading(true);
    setError('');
    try {
      await cameraService.bindImouAccount(phone.trim());
      onSuccess();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message || 'Liên kết thất bại. Kiểm tra lại số điện thoại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Link size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 dark:text-white">Liên kết Imou</h2>
              <p className="text-xs text-slate-500">Kết nối camera từ app Imou Life</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl mb-6">
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            📱 Nhập số điện thoại đã đăng ký tài khoản <strong>Imou Life</strong> của bạn.
            Camera đang được chia sẻ trên app sẽ tự động xuất hiện trên hệ thống Pet Eye.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2 mb-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Số điện thoại Imou Life *
          </label>
          <div className="relative">
            <Wifi size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleBind()}
              placeholder="0912 345 678"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Huỷ
          </button>
          <button
            onClick={handleBind}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Link size={16} />}
            {loading ? 'Đang liên kết...' : 'Liên kết'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ShopCamera() {
  // Camera state
  const [cameras, setCameras]           = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CameraDevice | null>(null);
  const [streamInfo, setStreamInfo]     = useState<CameraStream | null>(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingStream, setLoadingStream]   = useState(false);
  const [streamError, setStreamError]       = useState(false);

  // UI state
  const [isMuted, setIsMuted]           = useState(true);
  const [viewMode, setViewMode]         = useState<'single' | 'grid'>('single');
  const [showBindModal, setShowBindModal] = useState(false);
  const [activeTab, setActiveTab]       = useState<'list' | 'logs' | 'chat'>('list');

  // Chat & logs
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [careLogs, setCareLogs]         = useState<Record<string, CareLog[]>>({});
  const [newMessage, setNewMessage]     = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [newLog, setNewLog]             = useState({ action: '', desc: '', type: 'utensils' });

  // ─── Load Devices ───────────────────────────────────────────────────────────

  const fetchDevices = useCallback(async () => {
    setLoadingDevices(true);
    try {
      const devices = await cameraService.getDevices();
      setCameras(devices);
      if (devices.length > 0 && !selectedCamera) {
        setSelectedCamera(devices[0]);
      }
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoadingDevices(false);
    }
  }, [selectedCamera]);

  useEffect(() => { fetchDevices(); }, []);

  // ─── Load Stream when camera selected ──────────────────────────────────────

  const fetchStream = useCallback(async (deviceId: string) => {
    setLoadingStream(true);
    setStreamError(false);
    setStreamInfo(null);
    try {
      const stream = await cameraService.getLiveStream(deviceId);
      setStreamInfo(stream);
    } catch (err) {
      console.error('Failed to get stream:', err);
      setStreamError(true);
    } finally {
      setLoadingStream(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCamera) fetchStream(selectedCamera.deviceId);
  }, [selectedCamera?.deviceId]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleSelectCamera = (cam: CameraDevice) => {
    setSelectedCamera(cam);
  };

  const handleDeleteCamera = (deviceId: string) => {
    if (!window.confirm('Bạn có chắc muốn xoá camera này khỏi danh sách?')) return;
    setCameras(prev => prev.filter(c => c.deviceId !== deviceId));
    if (selectedCamera?.deviceId === deviceId) {
      const remaining = cameras.filter(c => c.deviceId !== deviceId);
      setSelectedCamera(remaining[0] ?? null);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedCamera) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'shop',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => ({ ...prev, [selectedCamera.deviceId]: [...(prev[selectedCamera.deviceId] || []), msg] }));
    setNewMessage('');
  };

  const handleAddLog = () => {
    if (!newLog.action || !newLog.desc || !selectedCamera) return;
    const colors: Record<string, string> = { utensils: '#f97316', droplets: '#00b4d8', activity: '#00b4d8', heart: '#ec4899' };
    const log: CareLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + (new Date().getHours() < 12 ? ' SA' : ' CH'),
      action: newLog.action,
      desc: newLog.desc,
      icon: newLog.type,
      color: colors[newLog.type] || '#f97316',
    };
    setCareLogs(prev => ({ ...prev, [selectedCamera.deviceId]: [log, ...(prev[selectedCamera.deviceId] || [])] }));
    setShowLogModal(false);
    setNewLog({ action: '', desc: '', type: 'utensils' });
  };

  // ─── Stats ──────────────────────────────────────────────────────────────────

  const totalCameras   = cameras.length;
  const onlineCameras  = cameras.filter(c => c.online).length;
  const offlineCameras = cameras.filter(c => !c.online).length;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-screen-2xl mx-auto px-5 md:px-8 py-8">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Video className="w-8 h-8 text-blue-600" />
              Quản lý Camera
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Theo dõi thú cưng đang lưu trú tại cơ sở
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBindModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg"
            >
              <Link size={18} />
              <span className="hidden sm:inline">Liên kết Imou</span>
            </button>
            <button
              onClick={fetchDevices}
              disabled={loadingDevices}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <RefreshCw size={18} className={loadingDevices ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Tải lại</span>
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'single' ? 'grid' : 'single')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#1a2b4c] text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Grid3x3 size={18} />
              <span className="hidden sm:inline">{viewMode === 'single' ? 'Xem lưới' : 'Xem đơn'}</span>
            </button>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng camera',      value: totalCameras,  icon: '📹', color: 'from-blue-500 to-blue-600' },
            { label: 'Đang hoạt động',   value: onlineCameras, icon: '🟢', color: 'from-green-500 to-green-600' },
            { label: 'Thú cưng lưu trú', value: onlineCameras, icon: '🐾', color: 'from-purple-500 to-purple-600' },
            { label: 'Offline',          value: offlineCameras,icon: '⚫', color: 'from-slate-500 to-slate-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} opacity-10`} />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {loadingDevices ? '—' : stat.value}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Loading State ── */}
        {loadingDevices ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
            <p className="font-medium">Đang tải danh sách camera từ Imou Cloud...</p>
          </div>
        ) : cameras.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Video size={40} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Chưa có camera nào</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-sm leading-relaxed">
              Bấm <strong>"Liên kết Imou"</strong> để nhập số điện thoại Imou Life của bạn.
              Camera đang được chia sẻ trên app sẽ tự động xuất hiện tại đây.
            </p>
            <button
              onClick={() => setShowBindModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Link size={18} /> Liên kết tài khoản Imou
            </button>
          </div>
        ) : viewMode === 'single' ? (
          /* ── Single View ── */
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            {/* Main Camera View */}
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-2xl overflow-hidden relative aspect-video shadow-2xl">
                {loadingStream ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-blue-400" />
                  </div>
                ) : streamError || !streamInfo ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                    <AlertCircle size={40} className="text-slate-500" />
                    <p className="text-sm">Không thể tải luồng video</p>
                    <button
                      onClick={() => selectedCamera && fetchStream(selectedCamera.deviceId)}
                      className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <HLSPlayer
                    streamUrl={streamInfo.streamUrl}
                    isMuted={isMuted}
                    onError={() => setStreamError(true)}
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

                {selectedCamera?.online && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="text-white">
                    <p className="text-sm opacity-80">{selectedCamera?.deviceId} — {selectedCamera?.deviceModel}</p>
                    <h3 className="text-2xl font-bold">{selectedCamera?.name}</h3>
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

              {/* Device Info Card */}
              {selectedCamera && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Device ID',    value: selectedCamera.deviceId },
                      { label: 'Model',        value: selectedCamera.deviceModel || 'Imou Camera' },
                      { label: 'Trạng thái',   value: selectedCamera.online ? '🟢 Online' : '⚫ Offline' },
                      { label: 'Giao thức',    value: streamInfo?.protocol || 'HLS' },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{label}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Camera List / Logs / Chat */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-fit lg:h-[700px]">
              {/* Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-700">
                {(['list', 'logs', 'chat'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === tab
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab === 'list' && 'Danh sách'}
                    {tab === 'logs' && <><ClipboardList size={14} /> Nhật ký</>}
                    {tab === 'chat' && <><MessageCircle size={14} /> Trò chuyện</>}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Tab: Camera List */}
                {activeTab === 'list' && (
                  <div className="p-4 space-y-3 overflow-y-auto">
                    {cameras.map((cam) => (
                      <div
                        key={cam.deviceId}
                        className={`relative group rounded-xl transition-all ${
                          selectedCamera?.deviceId === cam.deviceId
                            ? 'bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white shadow-lg'
                            : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <button onClick={() => handleSelectCamera(cam)} className="w-full text-left p-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                              {cam.coverUrl ? (
                                <img src={cam.coverUrl} alt={cam.name} className="w-full h-full object-cover" />
                              ) : (
                                <Video size={24} className="text-slate-400" />
                              )}
                              {cam.online && (
                                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-bold text-sm truncate ${selectedCamera?.deviceId === cam.deviceId ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                {cam.name}
                              </p>
                              <p className={`text-xs truncate ${selectedCamera?.deviceId === cam.deviceId ? 'text-white/70' : 'text-slate-400'}`}>
                                {cam.deviceId}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                                cam.online
                                  ? selectedCamera?.deviceId === cam.deviceId
                                    ? 'bg-white/20 text-white'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                  : selectedCamera?.deviceId === cam.deviceId
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-200 dark:bg-slate-600 text-slate-500'
                              }`}>
                                {cam.online ? 'Live' : 'Offline'}
                              </span>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCamera(cam.deviceId); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: Care Logs */}
                {activeTab === 'logs' && selectedCamera && (
                  <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian biểu hôm nay</h4>
                      <button onClick={() => setShowLogModal(true)} className="p-1.5 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20 transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-0 relative">
                      {(careLogs[selectedCamera.deviceId] || []).map((log, i, arr) => (
                        <div key={log.id} className="flex gap-4 py-3 relative group">
                          <div className="flex flex-col items-center gap-1 pt-1">
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 z-10 shadow-sm">
                              <LogIcon type={log.icon} color={log.color} />
                            </div>
                            {i < arr.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 absolute top-9 bottom-[-10px] left-[15px]" />}
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{log.action}</span>
                              <span className="text-[10px] text-slate-400 shrink-0 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">{log.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{log.desc}</p>
                          </div>
                        </div>
                      ))}
                      {!(careLogs[selectedCamera.deviceId]?.length) && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
                          <ClipboardList size={40} className="mb-3" />
                          <p className="text-sm">Chưa có nhật ký cho hôm nay</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Chat */}
                {activeTab === 'chat' && selectedCamera && (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                      {(chatMessages[selectedCamera.deviceId] || []).map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'shop' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'shop' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold shadow-sm ${msg.sender === 'shop' ? 'bg-[#1a2b4c] text-white' : 'bg-white text-[#1a2b4c] border border-slate-200'}`}>
                              {msg.sender === 'shop' ? 'S' : 'K'}
                            </div>
                            <div className={`flex flex-col ${msg.sender === 'shop' ? 'items-end' : 'items-start'}`}>
                              <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.sender === 'shop' ? 'bg-gradient-to-r from-[#1a2b4c] to-slate-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700'}`}>
                                {msg.text}
                              </div>
                              <p className="text-[9px] text-slate-400 mt-1">{msg.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {!chatMessages[selectedCamera.deviceId]?.length && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
                          <MessageCircle size={40} className="mb-3" />
                          <p className="text-sm">Chưa có tin nhắn</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 p-1.5">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Nhắn tin cho khách hàng..."
                          className="flex-1 bg-transparent text-sm px-2 py-1 outline-none text-slate-900 dark:text-white"
                        />
                        <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="w-10 h-10 bg-[#1a2b4c] text-white rounded-lg flex items-center justify-center hover:bg-slate-700 transition-all disabled:opacity-50">
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
          /* ── Grid View ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cameras.map((cam) => (
              <div key={cam.deviceId} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group relative">
                <div
                  className="relative aspect-video bg-slate-900 cursor-pointer flex items-center justify-center"
                  onClick={() => { setSelectedCamera(cam); setViewMode('single'); }}
                >
                  {cam.coverUrl ? (
                    <img src={cam.coverUrl} alt={cam.name} className="w-full h-full object-cover" />
                  ) : (
                    <Video size={40} className="text-slate-600" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {cam.online && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCamera(cam.deviceId); }}
                    className="absolute top-3 right-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 size={13} />
                  </button>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-sm">{cam.name}</p>
                    <p className="text-white/70 text-xs">{cam.deviceId}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{cam.deviceModel || 'Imou Camera'}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${cam.online ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                    {cam.online ? '● Online' : '● Offline'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bind Account Modal ── */}
      {showBindModal && (
        <BindAccountModal
          onClose={() => setShowBindModal(false)}
          onSuccess={fetchDevices}
        />
      )}

      {/* ── Add Log Modal ── */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Thêm nhật ký chăm sóc</h3>
              <button onClick={() => setShowLogModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Hoạt động *</label>
                <input
                  type="text"
                  value={newLog.action}
                  onChange={(e) => setNewLog({ ...newLog, action: e.target.value })}
                  placeholder="VD: Cho ăn"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Loại</label>
                <select
                  value={newLog.type}
                  onChange={(e) => setNewLog({ ...newLog, type: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none"
                >
                  <option value="utensils">🍽️ Ăn uống</option>
                  <option value="droplets">💧 Vệ sinh</option>
                  <option value="activity">🏃 Vận động</option>
                  <option value="heart">❤️ Sức khoẻ</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Mô tả *</label>
                <textarea
                  value={newLog.desc}
                  onChange={(e) => setNewLog({ ...newLog, desc: e.target.value })}
                  placeholder="Ghi chú chi tiết..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowLogModal(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Huỷ</button>
              <button onClick={handleAddLog} className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
