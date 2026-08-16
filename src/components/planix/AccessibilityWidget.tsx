import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Accessibility, 
  X, 
  RotateCcw, 
  Type, 
  ZoomIn, 
  ZoomOut, 
  AlignJustify, 
  MoveHorizontal, 
  MousePointer2, 
  Palette, 
  SunMedium, 
  BookOpen, 
  Link2, 
  SlidersHorizontal,
  Eye,
  Check,
  ChevronDown,
  Sparkles,
  ZapOff
} from 'lucide-react';
import { toast } from 'sonner';

export interface AccessibilitySettings {
  fontSize: number; // 0.9 | 1.0 | 1.1 | 1.2 | 1.3
  lineHeight: number; // 1.5 | 1.8 | 2.0 | 2.2
  letterSpacing: number; // 0 | 0.04 | 0.08 | 0.12
  cursor: 'default' | 'large-black' | 'large-yellow';
  colorFilter: 'none' | 'grayscale' | 'high-sat' | 'low-sat' | 'inverted';
  contrast: 'normal' | 'high-light' | 'high-dark';
  dyslexicFont: boolean;
  highlightLinks: boolean;
  readingGuide: boolean;
  reduceMotion: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 1.0,
  lineHeight: 1.5,
  letterSpacing: 0,
  cursor: 'default',
  colorFilter: 'none',
  contrast: 'normal',
  dyslexicFont: false,
  highlightLinks: false,
  readingGuide: false,
  reduceMotion: false,
};

const STORAGE_KEY = 'plx:accessibility_settings';

export default function AccessibilityWidget() {
  const location = useLocation();
  const pathname = location.pathname;

  // Restringir visibilidad al planificador y formularios
  const isPlannerOrForm = 
    pathname.startsWith('/planificaciones/nueva') ||
    pathname.startsWith('/planificaciones/nuevo') ||
    pathname.startsWith('/planificacion/') ||
    pathname.startsWith('/talleres/nuevo') ||
    pathname.startsWith('/herramientas/generador-examenes') ||
    pathname.startsWith('/herramientas/situaciones-aprendizaje') ||
    pathname.startsWith('/herramientas/apoyo-adicional') ||
    pathname.startsWith('/herramientas/generador-diplomas') ||
    pathname.startsWith('/herramientas/generador-grupos');

  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Error loading accessibility settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [mouseY, setMouseY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply settings directly to DOM
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Error saving accessibility settings:', e);
    }

    const root = document.documentElement;
    const body = document.body;

    // 1. Font Size
    root.style.setProperty('--a11y-font-scale', settings.fontSize.toString());

    // 2. Line Height
    if (settings.lineHeight > 1.5) {
      body.classList.add('a11y-custom-line-height');
      body.style.setProperty('--a11y-line-height', settings.lineHeight.toString());
    } else {
      body.classList.remove('a11y-custom-line-height');
      body.style.removeProperty('--a11y-line-height');
    }

    // 3. Letter Spacing
    if (settings.letterSpacing > 0) {
      body.classList.add('a11y-custom-letter-spacing');
      body.style.setProperty('--a11y-letter-spacing', `${settings.letterSpacing}em`);
    } else {
      body.classList.remove('a11y-custom-letter-spacing');
      body.style.removeProperty('--a11y-letter-spacing');
    }

    // 4. Cursor
    body.classList.remove('a11y-cursor-large-black', 'a11y-cursor-large-yellow');
    if (settings.cursor === 'large-black') {
      body.classList.add('a11y-cursor-large-black');
    } else if (settings.cursor === 'large-yellow') {
      body.classList.add('a11y-cursor-large-yellow');
    }

    // 5. Color Filters
    root.classList.remove(
      'a11y-filter-grayscale',
      'a11y-filter-high-sat',
      'a11y-filter-low-sat',
      'a11y-filter-inverted'
    );
    if (settings.colorFilter === 'grayscale') root.classList.add('a11y-filter-grayscale');
    else if (settings.colorFilter === 'high-sat') root.classList.add('a11y-filter-high-sat');
    else if (settings.colorFilter === 'low-sat') root.classList.add('a11y-filter-low-sat');
    else if (settings.colorFilter === 'inverted') root.classList.add('a11y-filter-inverted');

    // 6. Contrast
    root.classList.remove('a11y-contrast-high-light', 'a11y-contrast-high-dark');
    if (settings.contrast === 'high-light') root.classList.add('a11y-contrast-high-light');
    else if (settings.contrast === 'high-dark') root.classList.add('a11y-contrast-high-dark');

    // 7. Dyslexic Font
    if (settings.dyslexicFont) {
      body.classList.add('a11y-dyslexic-font');
    } else {
      body.classList.remove('a11y-dyslexic-font');
    }

    // 8. Highlight Links
    if (settings.highlightLinks) {
      body.classList.add('a11y-highlight-links');
    } else {
      body.classList.remove('a11y-highlight-links');
    }

    // 9. Reduce Motion
    if (settings.reduceMotion) {
      body.classList.add('a11y-reduce-motion');
    } else {
      body.classList.remove('a11y-reduce-motion');
    }
  }, [settings]);

  // Reading Guide mouse listener
  useEffect(() => {
    if (!settings.readingGuide) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [settings.readingGuide]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Check if any setting is active (non-default)
  const isCustomized = 
    settings.fontSize !== DEFAULT_SETTINGS.fontSize ||
    settings.lineHeight !== DEFAULT_SETTINGS.lineHeight ||
    settings.letterSpacing !== DEFAULT_SETTINGS.letterSpacing ||
    settings.cursor !== DEFAULT_SETTINGS.cursor ||
    settings.colorFilter !== DEFAULT_SETTINGS.colorFilter ||
    settings.contrast !== DEFAULT_SETTINGS.contrast ||
    settings.dyslexicFont !== DEFAULT_SETTINGS.dyslexicFont ||
    settings.highlightLinks !== DEFAULT_SETTINGS.highlightLinks ||
    settings.readingGuide !== DEFAULT_SETTINGS.readingGuide ||
    settings.reduceMotion !== DEFAULT_SETTINGS.reduceMotion;

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.success('Accesibilidad restablecida a valores por defecto');
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Si no está en el planificador o formularios, no mostrar el widget
  if (!isPlannerOrForm) return null;

  return (
    <>
      {/* 📏 Reading Guide Strip */}
      {settings.readingGuide && (
        <div
          className="fixed left-0 right-0 h-11 pointer-events-none z-[99999] border-y-2 border-amber-500/80 bg-amber-400/15 backdrop-blur-[0.5px] shadow-[0_0_24px_rgba(245,158,11,0.25)] transition-transform duration-75 ease-out"
          style={{ top: 0, transform: `translateY(${mouseY - 22}px)` }}
          aria-hidden="true"
        />
      )}

      {/* ♿ Main Container */}
      <div 
        ref={containerRef}
        className="fixed bottom-6 left-6 z-[80] flex flex-col items-start font-sans print:hidden sm:bottom-6 bottom-24 pointer-events-none a11y-ignore"
      >
        {/* Accessibility Modal / Popover */}
        <div
          className={`mb-3 w-[330px] sm:w-[360px] max-h-[80vh] overflow-y-auto sidebar-scrollbar bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-slate-200/80 dark:border-slate-800 transition-all duration-200 origin-bottom-left ${
            isOpen 
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 scale-95 translate-y-6 pointer-events-none'
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0046AB] dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                <Accessibility className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Accesibilidad Visual
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ajustes para lectura docente
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {isCustomized && (
                <button
                  onClick={handleReset}
                  title="Restablecer todos los ajustes"
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Reset</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all shadow-md border-none outline-none"
                aria-label="Cerrar panel de accesibilidad"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* 1. TAMAÑO DE TEXTO */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-[#0046AB] dark:text-blue-400" />
                  Tamaño de Texto
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-[#0046AB] dark:text-blue-300">
                  {Math.round(settings.fontSize * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1 bg-white dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                {[
                  { label: '90%', val: 0.9 },
                  { label: '100%', val: 1.0 },
                  { label: '110%', val: 1.1 },
                  { label: '120%', val: 1.2 },
                  { label: '130%', val: 1.3 },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => updateSetting('fontSize', opt.val)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      settings.fontSize === opt.val
                        ? 'bg-[#0046AB] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. INTERLINEADO Y ESPACIADO */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-3">
              {/* Interlineado */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <AlignJustify className="w-3.5 h-3.5 text-[#0046AB] dark:text-blue-400" />
                    Interlineado
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {settings.lineHeight === 1.5 ? 'Normal' : settings.lineHeight === 1.8 ? 'Cómodo' : settings.lineHeight === 2.0 ? 'Amplio' : 'Máximo'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 bg-white dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {[
                    { label: '1.5x', val: 1.5 },
                    { label: '1.8x', val: 1.8 },
                    { label: '2.0x', val: 2.0 },
                    { label: '2.2x', val: 2.2 },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => updateSetting('lineHeight', opt.val)}
                      className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        settings.lineHeight === opt.val
                          ? 'bg-[#0046AB] text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Espaciado de letras */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <MoveHorizontal className="w-3.5 h-3.5 text-[#0046AB] dark:text-blue-400" />
                    Espaciado de Letras
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 bg-white dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {[
                    { label: 'Normal', val: 0 },
                    { label: 'Medio', val: 0.04 },
                    { label: 'Amplio', val: 0.08 },
                    { label: 'Extra', val: 0.12 },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => updateSetting('letterSpacing', opt.val)}
                      className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        settings.letterSpacing === opt.val
                          ? 'bg-[#0046AB] text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. SATURACIÓN Y FILTROS DE COLOR */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                <Palette className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Filtros de Color & Saturación
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'none', label: 'Original', icon: '🌈' },
                  { id: 'grayscale', label: 'Monocromo', icon: '⬛' },
                  { id: 'high-sat', label: 'Alta Sat.', icon: '🎨' },
                  { id: 'low-sat', label: 'Baja Sat.', icon: '🌫️' },
                  { id: 'inverted', label: 'Invertir', icon: '🔄' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => updateSetting('colorFilter', item.id as any)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                      settings.colorFilter === item.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/20'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. CONTRASTE Y CURSOR */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-3">
              {/* Contraste */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                  <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                  Modo de Contraste
                </span>
                <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {[
                    { id: 'normal', label: 'Normal' },
                    { id: 'high-light', label: 'Alto Claro' },
                    { id: 'high-dark', label: 'Alto Oscuro' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => updateSetting('contrast', opt.id as any)}
                      className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        settings.contrast === opt.id
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cursor */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                  <MousePointer2 className="w-3.5 h-3.5 text-blue-500" />
                  Tamaño de Cursor
                </span>
                <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {[
                    { id: 'default', label: 'Normal' },
                    { id: 'large-black', label: 'Negro ↗' },
                    { id: 'large-yellow', label: 'Amarillo ↗' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => updateSetting('cursor', opt.id as any)}
                      className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        settings.cursor === opt.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. HERRAMIENTAS ADICIONALES (TOGGLES) */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Herramientas de Apoyo
              </span>

              {/* Fuente Amigable / Dislexia */}
              <div 
                onClick={() => updateSetting('dyslexicFont', !settings.dyslexicFont)}
                className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:border-emerald-400/50 transition-all select-none"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Tipografía Ultra-Legible</p>
                    <p className="text-[10px] text-slate-400">Optimizada para dislexia y fatiga visual</p>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${settings.dyslexicFont ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${settings.dyslexicFont ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Guía de Lectura */}
              <div 
                onClick={() => updateSetting('readingGuide', !settings.readingGuide)}
                className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:border-amber-400/50 transition-all select-none"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Guía de Lectura</p>
                    <p className="text-[10px] text-slate-400">Regla horizontal que sigue tu ratón</p>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${settings.readingGuide ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${settings.readingGuide ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Resaltar Enlaces */}
              <div 
                onClick={() => updateSetting('highlightLinks', !settings.highlightLinks)}
                className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:border-blue-400/50 transition-all select-none"
              >
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Resaltar Enlaces & Botones</p>
                    <p className="text-[10px] text-slate-400">Bordes de alto contraste interactivos</p>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${settings.highlightLinks ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${settings.highlightLinks ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Pausar Animaciones */}
              <div 
                onClick={() => updateSetting('reduceMotion', !settings.reduceMotion)}
                className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:border-purple-400/50 transition-all select-none"
              >
                <div className="flex items-center gap-2">
                  <ZapOff className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Pausar Animaciones</p>
                    <p className="text-[10px] text-slate-400">Reduce movimiento y efectos</p>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${settings.reduceMotion ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${settings.reduceMotion ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Reset button */}
          {isCustomized && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleReset}
                className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restablecer Todo a Valores de Fábrica
              </button>
            </div>
          )}
        </div>

        {/* 🔘 Floating Action Button (FAB) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir menú de accesibilidad"
          title="Menú de Accesibilidad Visual"
          className={`group relative w-12 h-12 sm:w-13 sm:h-13 rounded-full pointer-events-auto cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_25px_rgba(0,70,171,0.35)] ${
            isOpen
              ? 'bg-slate-900 text-white shadow-xl rotate-90'
              : 'bg-[#0046AB] text-white hover:bg-[#00388A]'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <Accessibility className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
          )}

          {/* Active customized indicator dot */}
          {!isOpen && isCustomized && (
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          )}
        </button>
      </div>
    </>
  );
}
