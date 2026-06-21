import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Mic, 
  Sparkles, 
  Bot, 
  FileText, 
  FileCheck, 
  BookOpen, 
  Mail, 
  User, 
  ArrowLeft,
  Crown,
  HelpCircle,
  Copy,
  Plus,
  Sliders,
  ArrowUp,
  Lightbulb,
  Globe
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getCurrentUser } from '../lib/storage';
import { generateChatResponse } from '../lib/services/aiService';
import { toast } from 'sonner';
import { consumeCredits, getCreditInfo } from '../lib/credits';
import ModalCreditos from '../components/ai/ModalCreditos';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function PlanixChat() {
  const navigate = useNavigate();
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  const currentUser = getCurrentUser();
  const isPro = currentUser?.suscripcion === 'pro';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreditsExhausted, setShowCreditsExhausted] = useState(false);
  const [creditsExhaustedInfo, setCreditsExhaustedInfo] = useState({ required: 2, current: 0 });

  const remainingMessages = (() => {
    const info = getCreditInfo('planix_chat');
    return Math.floor(info.currentCredits / Math.max(info.cost, 1));
  })();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const PLACEHOLDERS = [
    "Escribe un mensaje para Planix...",
    "Crear una rúbrica de evaluación...",
    "Ayúdame a planificar mi clase de hoy...",
    "Redactar un correo para los padres...",
    "Escribir comentarios para boletas...",
    "Bajar el nivel de lectura de un texto...",
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [thinkActive, setThinkActive] = useState(false);
  const [deepSearchActive, setDeepSearchActive] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cycle placeholder text when input is inactive
  useEffect(() => {
    if (isActive || inputMessage) return;

    const interval = setInterval(() => {
      setShowPlaceholder(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setShowPlaceholder(true);
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive, inputMessage]);

  // Close input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        if (!inputMessage) setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputMessage]);

  const handleActivate = () => setIsActive(true);

  // Suggested prompt templates matching user screenshot
  const suggestions = [
    { 
      label: 'Bajar el nivel de lectura', 
      prompt: 'Ayúdame a bajar el nivel de lectura del siguiente texto para que mis alumnos lo comprendan más fácilmente: \n\n[Inserta tu texto aquí]', 
    },
    { 
      label: 'Crear una hoja de trabajo', 
      prompt: 'Crea una hoja de trabajo divertida sobre el cuidado del medio ambiente para 4to de Primaria con preguntas de opción múltiple y una actividad reflexiva.', 
    },
    { 
      label: 'Crear una planificación/una clase', 
      prompt: 'Diseña una planificación diaria para el tema "Las Fracciones en la vida cotidiana" en 3er grado de Primaria, detallando inicio, desarrollo y cierre.', 
    },
    { 
      label: 'Crear una rúbrica de evaluación', 
      prompt: 'Genera una rúbrica analítica detallada de 3 niveles para evaluar una exposición oral sobre efemérides patrias dominicanas.', 
    },
    { 
      label: 'Escribir comentarios para libretas/boletas', 
      prompt: 'Escribe tres opciones de comentarios constructivos y profesionales para boletas de calificaciones: uno de felicitación por excelencia, uno sobre comportamiento disruptivo y uno de refuerzo de lectura.', 
    },
    { 
      label: 'Escribir un correo', 
      prompt: 'Redacta una plantilla de correo formal e invitadora dirigida a los padres/tutores para informarles sobre el buen desempeño de sus hijos y sugerirles un breve repaso de lectura en casa.', 
    },
    { 
      label: 'Ayúdame con otra cosa', 
      prompt: 'Hola Planix, tengo una duda pedagógica en mi aula y me gustaría que me asesores sobre cómo manejar la disciplina grupal tras el recreo.', 
    },
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
 
    // Consume credits for chat message (for free tier)
    const canProceed = consumeCredits('planix_chat');
    if (!canProceed) {
      const info = getCreditInfo('planix_chat');
      setCreditsExhaustedInfo({ required: info.cost, current: info.currentCredits });
      setShowCreditsExhausted(true);
      return;
    }
 
    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };
 
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsGenerating(true);

    try {
      // Format history payload
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      let promptToSend = textToSend;
      if (thinkActive) {
        promptToSend += "\n\n[Instrucción de Pensamiento Profundo: Por favor, realiza un desglose paso a paso de tu razonamiento pedagógico antes de dar la respuesta final, de forma muy estructurada y detallada.]";
      }
      if (deepSearchActive) {
        promptToSend += "\n\n[Instrucción de Búsqueda Web: Simula que has buscado información actualizada en internet sobre este tema para enriquecer tu respuesta con tendencias o datos recientes del currículo actual.]";
      }

      const responseText = await generateChatResponse(history, promptToSend);

      const newAssistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (err: any) {
      console.error(err);
      toast.error('Ocurrió un error al obtener la respuesta.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('¡Contenido copiado al portapapeles!');
  };

  return (
    <div className={`flex-1 self-stretch flex flex-col w-full min-w-0 h-[calc(100vh-32px)] pt-0 px-6 transition-all duration-150 ease-out select-none ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      {/* Main chat panel container (full page card style, fills height) */}
      <div className="flex-1 flex flex-col bg-[#FAF9F6] dark:bg-slate-900/60 rounded-[32px] border border-black/5 dark:border-white/5 overflow-hidden shadow-2xs relative mt-2 mb-2">
        {/* Floating Top Right "Nuevo Chat" Button */}
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([]);
              toast.success('Nueva conversación iniciada');
            }}
            className="absolute top-4 right-6 bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-200 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 font-bold text-[12px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-3xs cursor-pointer z-20 transition-all hover:scale-102 active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            Nuevo Chat
          </button>
        )}

        {/* Messages box */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between scrollbar-thin select-text">
          {messages.length === 0 ? (
            <div className="my-auto max-w-xl mx-auto w-full flex flex-col items-center justify-center text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-1">
                ¡Hola! Soy Planix Chat, tu asesor pedagógico.
              </h2>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-6">
                ¿En qué puedo ayudarte hoy?
              </p>

              {/* Suggestions aligned centered in rows */}
              <div className="flex flex-col gap-2.5 w-full items-center justify-center">
                {/* Row 1 */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={() => handleSendMessage(suggestions[0].prompt)} 
                    className="bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/5 shadow-3xs font-extrabold text-[12px] px-4 py-2 rounded-full flex items-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>📄</span> {suggestions[0].label}
                  </button>
                  <button 
                    onClick={() => handleSendMessage(suggestions[1].prompt)} 
                    className="bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/5 shadow-3xs font-extrabold text-[12px] px-4 py-2 rounded-full flex items-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>📝</span> {suggestions[1].label}
                  </button>
                </div>

                {/* Row 2 */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={() => handleSendMessage(suggestions[2].prompt)} 
                    className="bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/5 shadow-3xs font-extrabold text-[12px] px-4 py-2 rounded-full flex items-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>📊</span> {suggestions[2].label}
                  </button>
                  <button 
                    onClick={() => handleSendMessage(suggestions[3].prompt)} 
                    className="bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/5 shadow-3xs font-extrabold text-[12px] px-4 py-2 rounded-full flex items-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>🏫</span> {suggestions[3].label}
                  </button>
                </div>

                {/* Row 3 */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={() => handleSendMessage(suggestions[4].prompt)} 
                    className="bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/5 shadow-3xs font-extrabold text-[12px] px-4 py-2 rounded-full flex items-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>📋</span> {suggestions[4].label}
                  </button>
                  <button 
                    onClick={() => handleSendMessage(suggestions[5].prompt)} 
                    className="bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/5 shadow-3xs font-extrabold text-[12px] px-4 py-2 rounded-full flex items-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>💌</span> {suggestions[5].label}
                  </button>
                </div>

                {/* Row 4 */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={() => handleSendMessage(suggestions[6].prompt)} 
                    className="bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/5 shadow-3xs font-extrabold text-[12px] px-4 py-2 rounded-full flex items-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>🧐</span> {suggestions[6].label}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto w-full px-2 py-4 flex-1">
              {messages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex gap-3.5 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8.5 h-8.5 rounded-full border flex items-center justify-center shrink-0 shadow-3xs overflow-hidden ${
                    m.role === 'user' 
                      ? 'bg-slate-200 dark:bg-slate-800 border-slate-300/40 text-slate-700 dark:text-slate-200' 
                      : 'bg-white dark:bg-slate-900 border-black/5 p-1'
                  }`}>
                    {m.role === 'user' ? (
                      <img 
                        src={currentUser?.avatar_url || "https://randomuser.me/api/portraits/women/47.jpg"} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <img src="/logo planix.webp" alt="Planix" className="w-full h-full object-contain scale-110" />
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div className="flex flex-col gap-1.5">
                    {/* Message Bubble */}
                    <div className={`p-4 rounded-[20px] shadow-3xs leading-relaxed border ${
                      m.role === 'user'
                        ? 'bg-[#0046AB] border-indigo-650/10 text-white rounded-tr-none font-bold'
                        : 'bg-white dark:bg-slate-900 border-black/5 text-slate-800 dark:text-slate-200 rounded-tl-none font-medium'
                    }`}>
                      <div className="text-[13px] md:text-[13.5px] space-y-1">
                        {parseMarkdown(m.content)}
                      </div>
                      
                      {/* Copy action inside bubble context for assistant responses */}
                      {m.role === 'assistant' && (
                        <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2 mt-3 text-slate-400">
                          <button
                            onClick={() => copyToClipboard(m.content)}
                            className="p-1 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg transition-all flex items-center gap-1 text-[10px] font-extrabold cursor-pointer"
                            title="Copiar respuesta"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar texto</span>
                          </button>
                          <span className="text-[9px] font-bold">
                            {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}

                      {m.role === 'user' && (
                        <span className="text-[9px] block mt-1.5 text-right text-white/60 font-bold">
                          {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex gap-3.5 max-w-[80%] mr-auto items-center animate-pulse">
                  <div className="w-8.5 h-8.5 rounded-full bg-white dark:bg-slate-900 border border-black/5 p-1 flex items-center justify-center shrink-0 shadow-3xs">
                    <img src="/logo planix.webp" alt="Kali" className="w-full h-full object-contain scale-110" />
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 border border-black/5 text-slate-500 dark:text-slate-400 rounded-[20px] rounded-tl-none flex items-center gap-2">
                    <span className="text-[13px] font-bold">Kali está pensando...</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce delay-200" />
                      <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area & safety text */}
        <div className="shrink-0 p-4 bg-[#FAF9F6] dark:bg-slate-950/40 border-t border-slate-200/30 dark:border-white/5 flex flex-col items-center gap-3">
          {/* Remaining messages banner */}
          <div className="flex items-center gap-2 select-none">
            {isPro ? (
              <span className="text-[10px] md:text-xs bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border border-emerald-500/10">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                Acceso ilimitado a Kali con tu plan PRO
              </span>
            ) : (
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold">
                <span className="text-slate-500">
                  Te quedan {remainingMessages} mensajes hoy.
                </span>
                <button 
                  onClick={() => navigate('/perfil')}
                  className="bg-[#FFF8E6] text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-250/20 hover:bg-[#FFEFC7] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 transition-all shadow-3xs cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Hazte Premium y chatea sin límites
                </button>
              </div>
            )}
          </div>

          {/* Text Area Input Container designed after preetsuthar17/ai-chat-input */}
          <motion.div
            ref={wrapperRef}
            variants={{
              collapsed: {
                height: 58,
                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
                transition: { type: "spring", stiffness: 150, damping: 20 },
              },
              expanded: {
                height: 106,
                boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)",
                transition: { type: "spring", stiffness: 150, damping: 20 },
              },
            }}
            animate={isActive || inputMessage ? "expanded" : "collapsed"}
            initial="collapsed"
            style={{ overflow: "hidden", borderRadius: 24 }}
            className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 flex flex-col items-stretch transition-colors duration-150 relative cursor-text select-text"
            onClick={handleActivate}
          >
            <div className="flex flex-col items-stretch w-full h-full">
              {/* Input Row */}
              <div className="flex items-center gap-2 p-2 rounded-full w-full">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info('Adjuntar archivos próximamente disponible');
                  }}
                  className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer flex-shrink-0"
                  title="Adjuntar archivo"
                >
                  <Paperclip className="w-4.5 h-4.5" />
                </button>

                {/* Text Input & Placeholder */}
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isGenerating}
                    placeholder={isActive ? "Escribe un mensaje para Planix..." : ""}
                    className="w-full bg-transparent border-0 outline-none text-slate-850 dark:text-slate-200 text-[13px] md:text-sm font-semibold py-2 focus:ring-0 focus:outline-none relative z-10"
                    onFocus={handleActivate}
                  />
                  <div className="absolute left-0 top-0 w-full h-full pointer-events-none flex items-center py-2">
                    <AnimatePresence mode="wait">
                      {showPlaceholder && !isActive && !inputMessage && (
                        <motion.span
                          key={placeholderIndex}
                          className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 select-none pointer-events-none text-[13px] md:text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis z-0"
                          variants={{
                            initial: {},
                            animate: { transition: { staggerChildren: 0.025 } },
                            exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
                          }}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          {PLACEHOLDERS[placeholderIndex]
                            .split("")
                            .map((char, i) => (
                              <motion.span
                                key={i}
                                variants={{
                                  initial: { opacity: 0, filter: "blur(6px)", y: 6 },
                                  animate: { opacity: 1, filter: "blur(0px)", y: 0, transition: { opacity: { duration: 0.2 }, filter: { duration: 0.3 } } },
                                  exit: { opacity: 0, filter: "blur(6px)", y: -6, transition: { opacity: { duration: 0.15 }, filter: { duration: 0.2 } } },
                                }}
                                style={{ display: "inline-block" }}
                              >
                                {char === " " ? "\u00A0" : char}
                              </motion.span>
                            ))}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info('Mensajes de voz próximamente disponibles');
                    }}
                    className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                    title="Mensaje de voz"
                  >
                    <Mic className="w-4.5 h-4.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendMessage(inputMessage);
                    }}
                    disabled={!inputMessage.trim() || isGenerating}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      inputMessage.trim() && !isGenerating
                        ? 'bg-slate-800 text-white shadow-sm hover:bg-slate-700 cursor-pointer'
                        : 'bg-slate-100 text-slate-350 dark:bg-slate-850 dark:text-slate-600 cursor-not-allowed'
                    }`}
                    title="Enviar"
                  >
                    <ArrowUp className="w-4.5 h-4.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Expanded Controls */}
              <motion.div
                className="w-full flex justify-start px-4 items-center"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 10,
                    pointerEvents: "none" as const,
                    transition: { duration: 0.2 },
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    pointerEvents: "auto" as const,
                    transition: { duration: 0.3, delay: 0.05 },
                  },
                }}
                initial="hidden"
                animate={isActive || inputMessage ? "visible" : "hidden"}
                style={{ marginTop: 2 }}
              >
                <div className="flex gap-3 items-center pb-2.5">
                  {/* Think Toggle */}
                  <button
                    className={`flex items-center gap-1.5 px-4.5 py-1.5 rounded-full transition-all font-bold text-[12px] group cursor-pointer border ${
                      thinkActive
                        ? "bg-blue-600/10 border-blue-600/40 text-blue-900 dark:text-blue-300 dark:bg-blue-950/20"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-300 border-black/5 dark:border-white/5"
                    }`}
                    title="Pensar"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThinkActive((a) => !a);
                    }}
                  >
                    <Lightbulb
                      className="group-hover:fill-yellow-300 transition-all text-amber-500"
                      size={15}
                    />
                    Pensar
                  </button>

                  {/* Deep Search Toggle */}
                  <motion.button
                    className={`flex items-center gap-1.5 py-1.5 rounded-full transition font-bold text-[12px] whitespace-nowrap overflow-hidden justify-start cursor-pointer border ${
                      deepSearchActive
                        ? "bg-blue-600/10 border-blue-600/40 text-blue-900 dark:text-blue-300 dark:bg-blue-950/20"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-300 border-black/5 dark:border-white/5"
                    }`}
                    title="Búsqueda profunda"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeepSearchActive((a) => !a);
                    }}
                    animate={{
                      width: deepSearchActive ? 162 : 36,
                      paddingLeft: deepSearchActive ? 12 : 9,
                      paddingRight: deepSearchActive ? 12 : 9,
                    }}
                  >
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <Globe className="text-indigo-500" size={15} />
                    </div>
                    <motion.span
                      className="pb-[1px]"
                      initial={false}
                      animate={{
                        opacity: deepSearchActive ? 1 : 0,
                      }}
                      transition={{ duration: 0.15 }}
                    >
                      Búsqueda profunda
                    </motion.span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Subtext warning */}
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold select-none text-center">
            Puede cometer errores. Tu criterio docente es clave. Revisa y personaliza.
          </span>
        </div>
      </div>

      <ModalCreditos
        isOpen={showCreditsExhausted}
        onClose={() => setShowCreditsExhausted(false)}
        requiredCredits={creditsExhaustedInfo.required}
        currentCredits={creditsExhaustedInfo.current}
        actionName="enviar un mensaje en Planix Chat"
      />
    </div>
  );
}

function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, index) => {
    // Heading 3
    if (line.startsWith('### ')) {
      return (
        <h3 key={index} className="text-base font-black text-slate-800 dark:text-white mt-3 mb-1.5 flex items-center gap-1.5">
          {line.replace('### ', '')}
        </h3>
      );
    }
    // Heading 2
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-lg font-black text-slate-800 dark:text-white mt-4 mb-2 flex items-center gap-1.5">
          {line.replace('## ', '')}
        </h2>
      );
    }
    // Bullet list item
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const content = line.trim().replace(/^[\*\-]\s+/, '');
      return (
        <li key={index} className="list-disc ml-5 my-1 text-[13px] font-medium text-slate-700 dark:text-slate-350">
          {renderBold(content)}
        </li>
      );
    }
    // Table rows styling
    if (line.trim().startsWith('|')) {
      // Skip header divider line
      if (line.includes('---')) return null;
      const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
      const isHeader = index === 0 || (lines[index - 1] && lines[index - 1].trim().startsWith('|') === false);
      
      return (
        <div key={index} className={`grid grid-cols-2 gap-2 p-2.5 text-xs ${
          isHeader ? 'bg-slate-100 dark:bg-slate-800 font-extrabold rounded-t-xl border-b border-black/5 dark:border-white/5' : 'bg-white dark:bg-slate-900 border-b border-black/5 dark:border-white/5 last:rounded-b-xl'
        }`}>
          {cells.map((cell, cIdx) => (
            <div key={cIdx} className="break-words font-semibold">{renderBold(cell)}</div>
          ))}
        </div>
      );
    }
    // Default paragraph
    return (
      <p key={index} className="my-1.5 text-[13.5px] leading-relaxed">
        {renderBold(line)}
      </p>
    );
  });
}

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-extrabold text-[#0046AB] dark:text-indigo-400">{part}</strong>;
    }
    return part;
  });
}
