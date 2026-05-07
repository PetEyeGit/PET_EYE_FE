import React, { useRef, useEffect } from 'react';
import { Send, Paperclip, MessageCircle, ChevronLeft } from 'lucide-react';
import type { ChatMessage } from '../../../services/admin.service';

export interface ConversationThreadProps {
    messages: ChatMessage[];
    currentUserEmail?: string;
    connected: boolean;
    onSendMessage: (msg: string) => void;
    input: string;
    setInput: (val: string) => void;
    headerInfo?: {
        title: string;
        subtitle?: string;
        icon?: React.ReactNode;
        showStatus?: boolean;
    };
    onBack?: () => void;
    placeholder?: string;
    disableInput?: boolean;
    hideHeader?: boolean;
    containerClassName?: string;
}

export default function ConversationThread({
    messages,
    currentUserEmail,
    connected,
    onSendMessage,
    input,
    setInput,
    headerInfo,
    onBack,
    placeholder = "Nhập nội dung tin nhắn...",
    disableInput = false,
    hideHeader = false,
    containerClassName = ""
}: ConversationThreadProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || !connected || disableInput) return;
        onSendMessage(input);
    };

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-slate-900 relative ${containerClassName}`}>
            {/* Header */}
            {!hideHeader && headerInfo && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        {headerInfo.icon && (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                {headerInfo.icon}
                            </div>
                        )}
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                                {headerInfo.title}
                            </h2>
                            {headerInfo.subtitle && (
                                <p className="text-xs text-slate-500 mt-0.5">{headerInfo.subtitle}</p>
                            )}
                            {headerInfo.showStatus !== false && (
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {connected ? 'Trực tuyến' : 'Ngoại tuyến'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-600">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                            <MessageCircle size={32} className="opacity-20 text-slate-500" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.1em] opacity-50">Bắt đầu trò chuyện</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderEmail === currentUserEmail;
                        const senderNameMap: Record<string, string> = {
                            'ADMIN': 'Hệ thống',
                            'SHOP_OWNER': 'Chủ Shop',
                            'STAFF': 'Nhân viên',
                            'USER': 'Khách hàng'
                        };
                        const senderDisplay = senderNameMap[msg.senderRole] || 'Người dùng';

                        return (
                            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex flex-col gap-1.5 max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isMe && (
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                                            {senderDisplay}
                                        </span>
                                    )}
                                    <div className={`px-4 sm:px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words
                                        ${isMe
                                            ? 'bg-primary text-white rounded-br-none shadow-primary/10'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-bl-none border border-slate-100 dark:border-slate-700'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 px-2 uppercase tracking-tight">
                                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 shrink-0 relative">
                {!connected && (
                    <div className="absolute inset-x-0 -top-6 flex justify-center z-20">
                        <span className="px-4 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg animate-pulse">
                            Mất kết nối - Đang thử lại...
                        </span>
                    </div>
                )}
                <form onSubmit={handleSend} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-full p-1.5 pl-4 sm:pl-6 shadow-inner focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                    <button type="button" className="hidden sm:block text-slate-400 hover:text-primary transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholder}
                        disabled={disableInput}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 py-2 sm:py-3 outline-none min-w-0"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || !connected || disableInput}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex shrink-0 items-center justify-center transition-all ${
                            input.trim() && connected && !disableInput 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95' 
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                        }`}
                    >
                        <Send size={18} className={input.trim() && connected && !disableInput ? 'translate-x-0.5 -translate-y-0.5' : ''} />
                    </button>
                </form>
            </div>
        </div>
    );
}
