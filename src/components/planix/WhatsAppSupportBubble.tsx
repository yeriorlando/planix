import React, { useState, useEffect, useRef } from 'react';
import { X, User, Lightbulb, Wrench, MessageCircle, ChevronLeft, Send, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getCurrentUser } from '../../lib/storage';
import { API_BASE_URL } from '../../lib/services/d1Client';

type ViewMode = 'main' | 'suggest' | 'report' | 'success';

export default function WhatsAppSupportBubble() {
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<ViewMode>('main');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [showHelpPrompt, setShowHelpPrompt] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const pathname = location.pathname;

    const user = getCurrentUser();
    const whatsappUrl = "https://chat.whatsapp.com/CTxnZvEz6Qr2I2piuSNSDO";

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    // Mostrar mensaje "¿Necesitas ayuda?" a los 3 segundos en landing y dashboard
    useEffect(() => {
        const isLanding = pathname === '/' || pathname === '' || pathname.startsWith('/#');
        const isDashboard = pathname === '/dashboard' || pathname.startsWith('/coordinador/dashboard');

        if (!isLanding && !isDashboard) {
            setShowHelpPrompt(false);
            return;
        }

        let hideTimer: any;
        const timer = setTimeout(() => {
            setShowHelpPrompt(true);

            hideTimer = setTimeout(() => {
                setShowHelpPrompt(false);
            }, 6000);
        }, 3000);

        return () => {
            clearTimeout(timer);
            if (hideTimer) clearTimeout(hideTimer);
        };
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const resetForm = () => {
        setMessage('');
        setAttachedFile(null);
        setIsSubmitting(false);
        setErrorMessage(null);
        setView('main');
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => setView('main'), 200);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            let attachmentData: { filename: string; content: string } | undefined = undefined;

            if (attachedFile) {
                // Check size (Max 5MB)
                if (attachedFile.size > 5 * 1024 * 1024) {
                    setErrorMessage('La imagen es demasiado pesada. Máximo 5MB.');
                    setIsSubmitting(false);
                    return;
                }

                // Convert file to base64 string
                const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        const base64String = (reader.result as string).split(',')[1];
                        resolve(base64String);
                    };
                    reader.onerror = error => reject(error);
                });

                const base64Content = await toBase64(attachedFile);
                attachmentData = {
                    filename: attachedFile.name,
                    content: base64Content
                };
            }

            const payload = {
                type: view,
                message: message,
                userEmail: user?.email || 'anonimo@planix.do',
                userName: user?.nombre || 'Usuario',
                attachment: attachmentData
            };

            const targetUrl = API_BASE_URL && API_BASE_URL.startsWith('http')
                ? `${API_BASE_URL}/api/support/message`
                : '/api/support/message';

            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Error al enviar mensaje');
            }

            setView('success');
            setTimeout(() => {
                handleClose();
                resetForm();
            }, 3000);
        } catch (error: any) {
            console.error('Error:', error);
            setErrorMessage(error.message || 'Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const hidePaths = [
        '/herramientas/chat-pdf',
        '/herramientas/sopa-de-letras',
        '/herramientas/crucigrama',
        '/herramientas/ruleta'
    ];
    const shouldHide = !isVisible || 
                       pathname.startsWith('/juegos') || 
                       pathname.startsWith('/dinamicas') || 
                       hidePaths.some(p => pathname.startsWith(p));

    if (shouldHide) return null;
    const firstName = user?.nombre ? user.nombre.split(' ')[0] : 'Docente';
    return (
        <div ref={containerRef} className="fixed bottom-6 right-6 z-55 flex flex-col items-end font-sans print:hidden sm:bottom-6 bottom-24 pointer-events-none">
            {/* Support Hub Menu */}
            <div
                className={`mb-3 w-[290px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800/80 overflow-hidden transition-all duration-200 transform origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'
                    }`}
            >
                {/* View: Main Menu */}
                {view === 'main' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Header */}
                        <div className="bg-[#FAF9F6] dark:bg-slate-900/50 p-5 border-b border-slate-100 dark:border-slate-800/60 text-center">
                            <div className="flex items-center justify-center mb-3">
                                <img
                                    src="/logo planix.webp"
                                    alt="Planix"
                                    className="h-11 w-auto object-contain dark:brightness-125 select-none pointer-events-none"
                                />
                            </div>
                            <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                                Hola {firstName} 👋
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">¿Cómo podemos ayudarte?</p>
                        </div>

                        {/* Options */}
                        <div className="p-3 flex flex-col gap-1">
                            <button
                                onClick={() => window.location.href = '/guides'}
                                className="flex items-center gap-3 w-full py-1.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-xl transition-all text-left group cursor-pointer"
                            >
                                <div className="w-8 h-8 bg-blue-500/10 dark:bg-blue-950/40 text-[#0046ab] dark:text-blue-405 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                    <User size={15} className="fill-blue-500/20 text-[#0046ab] dark:text-blue-405" />
                                </div>
                                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Centro de ayuda</span>
                            </button>

                            <button
                                onClick={() => setView('suggest')}
                                className="flex items-center gap-3 w-full py-1.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-xl transition-all text-left group cursor-pointer"
                            >
                                <div className="w-8 h-8 bg-amber-500/10 dark:bg-amber-950/40 text-amber-650 dark:text-amber-400 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                    <Lightbulb size={15} className="fill-amber-500/20 text-amber-655 dark:text-amber-400" />
                                </div>
                                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Sugerir función</span>
                            </button>

                            <button
                                onClick={() => setView('report')}
                                className="flex items-center gap-3 w-full py-1.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-xl transition-all text-left group cursor-pointer"
                            >
                                <div className="w-8 h-8 bg-slate-500/10 dark:bg-slate-800/60 text-slate-650 dark:text-slate-400 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                    <Wrench size={15} className="fill-slate-500/20 text-slate-650 dark:text-slate-455" />
                                </div>
                                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Reportar un error</span>
                            </button>

                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 w-full py-1.5 px-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/15 rounded-xl transition-all text-left group"
                            >
                                <div className="w-8 h-8 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                    <MessageCircle size={15} className="fill-emerald-500/20 text-emerald-650 dark:text-emerald-450" />
                                </div>
                                <span className="text-[13px] font-extrabold text-emerald-600 dark:text-emerald-400">Comunidad de Whatsapp</span>
                            </a>
                        </div>
                    </div>
                )}

                {/* View: Suggest / Report Form */}
                {(view === 'suggest' || view === 'report') && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300 p-5">
                        <button
                            onClick={() => setView('main')}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 transition-colors text-[10px] font-bold uppercase tracking-wider mb-4 cursor-pointer"
                        >
                            <ChevronLeft size={12} />
                            Volver
                        </button>

                        <div className="flex items-center gap-2.5 mb-4">
                            <div className={`w-10 h-10 ${view === 'suggest' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-655'} rounded-xl flex items-center justify-center shrink-0`}>
                                {view === 'suggest' ? <Lightbulb size={20} className="fill-amber-500/20 text-amber-550" /> : <Wrench size={20} className="fill-slate-500/20 text-slate-650" />}
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                                    {view === 'suggest' ? 'Sugerir función' : 'Reportar error'}
                                </h3>
                                <p className="text-slate-455 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                                    {view === 'suggest' ? 'Cuéntanos tu idea' : 'Detalles del problema'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={view === 'suggest' ? "¿Qué te gustaría ver en Planix?" : "¿Qué salió mal? Descríbelo aquí..."}
                                className="w-full h-28 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none resize-none text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                            />

                            {view === 'report' && (
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`flex items-center gap-2.5 w-full p-2.5 border border-dashed rounded-xl transition-all cursor-pointer text-xs font-bold shadow-sm ${attachedFile ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600' : 'border-slate-200 dark:border-slate-800 text-slate-500 bg-white dark:bg-slate-950 hover:bg-slate-50'
                                            }`}
                                    >
                                        <ImageIcon size={16} />
                                        <span className="text-[11px] font-bold truncate">
                                            {attachedFile ? attachedFile.name : 'Subir captura (opcional)'}
                                        </span>
                                        {attachedFile && <X size={12} className="ml-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setAttachedFile(null); }} />}
                                    </button>
                                </div>
                            )}

                            {errorMessage && (
                                <div className="p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <X className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting || !message.trim()}
                                className="w-full py-2.5 bg-[#0046AB] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Enviar {view === 'suggest' ? 'Propuesta' : 'Reporte'}
                                        <Send size={13} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* View: Success */}
                {view === 'success' && (
                    <div className="animate-in zoom-in duration-500 p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-emerald-100/55 dark:border-emerald-900/20">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">¡Recibido!</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Gracias por ayudarnos a mejorar Planix. Revisaremos esto pronto.</p>
                    </div>
                )}
            </div>

            {/* Prompt & Main Toggle Button Container */}
            <div 
                className="relative flex items-center"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Floating Speech Prompt ("¿Necesitas ayuda?") */}
                {(showHelpPrompt || isHovered) && !isOpen && (
                    <div
                        onClick={() => {
                            setShowHelpPrompt(false);
                            setIsHovered(false);
                            setIsOpen(true);
                        }}
                        className="mr-3 flex items-center gap-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-2xl shadow-[0_12px_35px_rgba(0,0,0,0.2)] border border-slate-200/80 dark:border-slate-800 cursor-pointer pointer-events-auto transition-all hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-right-3 zoom-in-95 duration-200 select-none whitespace-nowrap z-50"
                    >
                        <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0046AB] dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                            👋
                        </div>
                        <div className="flex flex-col text-left pr-1">
                            <span className="text-xs font-bold leading-tight">¿Necesitas ayuda?</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">¡Haz clic aquí!</span>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowHelpPrompt(false);
                                setIsHovered(false);
                            }}
                            className="w-5 h-5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-0.5 cursor-pointer"
                            aria-label="Cerrar aviso"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Main Toggle Button */}
                <button
                    onClick={() => {
                        setShowHelpPrompt(false);
                        setIsHovered(false);
                        isOpen ? handleClose() : setIsOpen(true);
                    }}
                    className={`group relative w-14 h-14 rounded-full pointer-events-auto cursor-pointer ${isOpen ? 'bg-slate-900 shadow-xl' : 'bg-[#0046AB] shadow-[0_8px_30px_rgba(0,70,171,0.45)]'
                        } flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 animate-in zoom-in slide-in-from-bottom-8`}
                >
                    {/* Pulse Ring */}
                    {!isOpen && (
                        <span className="absolute inset-0 rounded-full bg-[#0046AB] animate-ping opacity-15 transition-opacity" style={{ animationDuration: '3.5s' }}></span>
                    )}

                    {isOpen ? (
                        <X className="w-7 h-7 text-white transition-all duration-300 rotate-0 group-hover:rotate-90" />
                    ) : (
                        <div className="rotate-3 group-hover:rotate-0 transition-transform duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    )}

                    {/* Counter Badge */}
                    {!isOpen && (
                        <span className="absolute top-0 right-0 flex h-5 w-5">
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center border-[2px] border-white dark:border-slate-900 shadow-sm scale-90">
                                <span className="text-[8px] text-white font-black leading-none animate-pulse">1</span>
                            </span>
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
