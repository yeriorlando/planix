import React from 'react';
import { X } from 'lucide-react';

interface ModalGenerandoProps {
    isOpen: boolean;
    onCancel?: () => void;
    title?: string;
    description?: string;
}

export default function ModalGenerando({ 
    isOpen, 
    onCancel, 
    title = 'Generando contenido',
    description = 'Elaborando tu recurso con inteligencia artificial. Esto puede tomar unos segundos.'
}: ModalGenerandoProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-[380px] p-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 mx-4 overflow-hidden">
                <div className="flex flex-col items-center justify-center p-8 pt-10 pb-7 text-center">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1.5 shadow-md transition-all duration-200 cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                    
                    <div className="w-32 h-32 flex items-center justify-center relative overflow-hidden select-none pointer-events-none mb-2">
                        {/* @ts-ignore */}
                        <lottie-player
                            src="/animacion.json"
                            background="transparent"
                            speed="1.2"
                            style={{ width: "130px", height: "130px" }}
                            loop
                            autoplay
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <h4 className="text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                            {title}
                        </h4>
                        <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed font-bold">
                            {description}
                        </p>
                    </div>

                    <div className="w-full max-w-[260px] h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-5 relative">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full absolute top-0"
                            style={{
                                width: '50%',
                                animation: 'modalGenerandoSlide 1.6s ease-in-out infinite',
                            }}
                        />
                        <style>{`
                            @keyframes modalGenerandoSlide {
                                0% { left: -50%; }
                                100% { left: 150%; }
                            }
                        `}</style>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-500 dark:text-zinc-400">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500/20 border-t-indigo-600 animate-spin" />
                        <span className="font-semibold tracking-wide">Generando...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
