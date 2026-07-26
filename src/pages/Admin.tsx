import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { loadAIConfig } from '../lib/services/aiService';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { requestD1 } from '../lib/services/d1Client';
import { 
  Layout,
  Brain, 
  Key, 
  ChevronDown, 
  CheckCircle, 
  Activity, 
  Database, 
  ArrowLeft,
  ShieldAlert,
  LogOut,
  UserCheck,
  Sparkles,
  Zap,
  Server,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Sliders,
  Users,
  BookOpen,
  Coins
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';


// ==========================================
// Helpers para sincronizar configuración global
// ==========================================
export async function getSiteConfig<T>(key: string): Promise<T | null> {
  try {
    const data = await requestD1<any>(`/api/site-configs/${key}`);
    if (data && data.value !== undefined) {
      return data.value as T;
    }
  } catch (e) {
    console.warn("No se pudo obtener la configuración global de D1:", e);
  }
  
  try {
    const raw = localStorage.getItem(`plx:site_config:${key}`);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
}

export async function updateSiteConfig(key: string, value: any): Promise<void> {
  localStorage.setItem(`plx:site_config:${key}`, JSON.stringify(value));
  
  if (key === 'ai_config') {
    const currentLocal = localStorage.getItem('plx:ai_config');
    let parsedLocal = currentLocal ? JSON.parse(currentLocal) : {};
    
    const updatedLocal = {
      ...parsedLocal,
      activeProvider: value.activeProvider || parsedLocal.activeProvider || 'openai',
      providers: {
        ...parsedLocal.providers,
        ...value.providers
      },
      generationParams: value.generationParams || parsedLocal.generationParams,
      chatAssistantEnabled: value.isChatAssistantEnabled !== undefined ? value.isChatAssistantEnabled : parsedLocal.chatAssistantEnabled
    };
    
    localStorage.setItem('plx:ai_config', JSON.stringify(updatedLocal));
    value = updatedLocal;
  }
  
  try {
    await requestD1<any>("/api/site-configs", "POST", { key, value, updated_at: new Date().toISOString() });
  } catch (e) {
    console.warn("No se pudo guardar la configuración global en D1:", e);
  }
}

// ==========================================
// Custom hook para el estado del panel de configuración de IA
// ==========================================
export function usePlatformSettings() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [settings, setSettings] = useState(() => {
    const local = loadAIConfig();
    return {
      aiProviders: local.providers,
      activeProvider: local.activeProvider,
      generationParams: local.generationParams,
      isChatAssistantEnabled: local.chatAssistantEnabled
    };
  });

  useEffect(() => {
    const local = loadAIConfig();
    setSettings({
      aiProviders: local.providers,
      activeProvider: local.activeProvider,
      generationParams: local.generationParams,
      isChatAssistantEnabled: local.chatAssistantEnabled
    });
    setHasHydrated(true);
  }, []);

  const updateProviderConfig = (provider: string, config: any) => {
    setSettings(prev => {
      const updatedProviders = {
        ...prev.aiProviders,
        [provider]: {
          ...prev.aiProviders[provider as any],
          ...config
        }
      };
      
      const rawLocal = localStorage.getItem("plx:ai_config");
      const currentLocal = rawLocal ? JSON.parse(rawLocal) : {};
      const newLocal = {
        ...currentLocal,
        providers: updatedProviders
      };
      localStorage.setItem("plx:ai_config", JSON.stringify(newLocal));

      return {
        ...prev,
        aiProviders: updatedProviders
      };
    });
  };

  const updateGenerationParams = (params: any) => {
    setSettings(prev => {
      const updatedParams = {
        ...prev.generationParams,
        ...params
      };

      const rawLocal = localStorage.getItem("plx:ai_config");
      const currentLocal = rawLocal ? JSON.parse(rawLocal) : {};
      const newLocal = {
        ...currentLocal,
        generationParams: updatedParams
      };
      localStorage.setItem("plx:ai_config", JSON.stringify(newLocal));

      return {
        ...prev,
        generationParams: updatedParams
      };
    });
  };

  const setActiveProvider = (provider: any) => {
    setSettings(prev => {
      const rawLocal = localStorage.getItem("plx:ai_config");
      const currentLocal = rawLocal ? JSON.parse(rawLocal) : {};
      const newLocal = {
        ...currentLocal,
        activeProvider: provider
      };
      localStorage.setItem("plx:ai_config", JSON.stringify(newLocal));

      return {
        ...prev,
        activeProvider: provider
      };
    });
  };

  const updateChatAssistantEnabled = (enabled: boolean) => {
    setSettings(prev => {
      const rawLocal = localStorage.getItem("plx:ai_config");
      const currentLocal = rawLocal ? JSON.parse(rawLocal) : {};
      const newLocal = {
        ...currentLocal,
        chatAssistantEnabled: enabled
      };
      localStorage.setItem("plx:ai_config", JSON.stringify(newLocal));

      return {
        ...prev,
        isChatAssistantEnabled: enabled
      };
    });
  };

  const hydrateAllSettings = (globalConfig: {
    providers?: Record<string, any>;
    activeProvider?: string;
    generationParams?: any;
    isChatAssistantEnabled?: boolean;
  }) => {
    setSettings(prev => {
      const updatedProviders = { ...prev.aiProviders } as typeof prev.aiProviders;
      if (globalConfig.providers) {
        Object.entries(globalConfig.providers).forEach(([provider, config]: [string, any]) => {
          if (updatedProviders[provider as keyof typeof prev.aiProviders]) {
            updatedProviders[provider as keyof typeof prev.aiProviders] = {
              ...updatedProviders[provider as keyof typeof prev.aiProviders],
              ...config
            };
          }
        });
      }

      const updatedParams = (globalConfig.generationParams
        ? { ...prev.generationParams, ...globalConfig.generationParams }
        : prev.generationParams) as typeof prev.generationParams;

      const updatedActiveProvider = (globalConfig.activeProvider || prev.activeProvider) as "openai" | "gemini" | "groq" | "deepseek";
      
      const updatedChat = globalConfig.isChatAssistantEnabled !== undefined
        ? globalConfig.isChatAssistantEnabled
        : prev.isChatAssistantEnabled;

      const rawLocal = localStorage.getItem("plx:ai_config");
      const currentLocal = rawLocal ? JSON.parse(rawLocal) : {};
      const newLocal = {
        ...currentLocal,
        activeProvider: updatedActiveProvider,
        providers: updatedProviders,
        generationParams: updatedParams,
        chatAssistantEnabled: updatedChat
      };
      localStorage.setItem("plx:ai_config", JSON.stringify(newLocal));

      return {
        aiProviders: updatedProviders,
        activeProvider: updatedActiveProvider,
        generationParams: updatedParams,
        isChatAssistantEnabled: updatedChat
      };
    });
  };

  return {
    settings,
    updateProviderConfig,
    updateGenerationParams,
    setActiveProvider,
    updateChatAssistantEnabled,
    hydrateAllSettings,
    hasHydrated
  };
}

// ==========================================
// Constantes del Proveedor
// ==========================================
const defaultSettings = {
    aiProviders: {
        openai: {
            apiKey: undefined,
            enabled: true,
            defaultModel: 'gpt-4o-mini',
            availableModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            useCustomServer: false,
            customApiKey: undefined,
            customBaseURL: undefined
        },
        gemini: {
            apiKey: undefined,
            enabled: false,
            defaultModel: 'gemini-3.5-flash',
            availableModels: [
                'gemini-3.0-pro',
                'gemini-3.5-flash',
                'gemini-3.1-flash-lite',
                'gemini-2.5-pro',
                'gemini-2.5-flash',
                'gemini-2.5-flash-lite'
            ],
            useCustomServer: false,
            customApiKey: undefined,
            customBaseURL: undefined
        },
        claude: {
            apiKey: undefined,
            enabled: false,
            defaultModel: 'claude-3-5-sonnet-20241022',
            availableModels: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
            useCustomServer: false,
            customApiKey: undefined,
            customBaseURL: undefined
        },
        grok: {
            apiKey: undefined,
            enabled: false,
            defaultModel: 'grok-beta',
            availableModels: ['grok-beta'],
            useCustomServer: false,
            customApiKey: undefined,
            customBaseURL: undefined
        },
        groq: {
            apiKey: undefined,
            enabled: false,
            defaultModel: 'llama-3.1-70b-versatile',
            availableModels: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
            useCustomServer: false,
            customApiKey: undefined,
            customBaseURL: undefined
        },
        deepseek: {
            apiKey: undefined,
            enabled: true,
            defaultModel: 'deepseek-v4-flash',
            availableModels: ['deepseek-v4-flash', 'deepseek-v4-pro'],
            useCustomServer: false,
            customApiKey: undefined,
            customBaseURL: undefined
        }
    },
    generationParams: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0
    }
};

type AIProviderType = 'openai' | 'gemini' | 'claude' | 'grok' | 'groq' | 'deepseek';

const providerLabels: Record<AIProviderType, string> = {
    openai: 'OpenAI',
    gemini: 'Google Gemini',
    claude: 'Anthropic Claude',
    grok: 'xAI Grok',
    groq: 'Groq',
    deepseek: 'DeepSeek'
};

const visibleProviders: AIProviderType[] = ['openai', 'gemini', 'groq', 'deepseek'];

// ==========================================
// Helpers para Formatear Modelos
// ==========================================
const isRecommendedModel = (model: string): boolean => {
  const lowercase = model.toLowerCase();
  return (
    lowercase === 'gpt-4o' ||
    lowercase === 'gpt-4o-mini' ||
    lowercase === 'gemini-3.5-flash' ||
    lowercase === 'gemini-2.5-flash' ||
    lowercase === 'deepseek-v4-flash' ||
    lowercase === 'llama-3.1-70b-versatile'
  );
};

const modelDisplayName = (model: string): string => {
  if (model.startsWith('gpt-4o-mini')) return 'GPT-4o Mini';
  if (model.startsWith('gpt-4o')) return 'GPT-4o';
  if (model.startsWith('gpt-4-turbo')) return 'GPT-4 Turbo';
  if (model.startsWith('gpt-3.5-turbo')) return 'GPT-3.5 Turbo';
  if (model.startsWith('gemini-3.0-pro')) return 'Gemini 3 Pro';
  if (model.startsWith('gemini-3.5-flash')) return 'Gemini 3.5 Flash';
  if (model.startsWith('gemini-3.1-flash-lite')) return 'Gemini 3.1 Flash-Lite';
  if (model.startsWith('gemini-2.5-pro')) return 'Gemini 2.5 Pro';
  if (model.startsWith('gemini-2.5-flash')) return 'Gemini 2.5 Flash';
  if (model.startsWith('gemini-2.5-flash-lite')) return 'Gemini 2.5 Flash-Lite';
  if (model.startsWith('llama-3.1-70b')) return 'Llama 3.1 70B';
  if (model.startsWith('llama-3.1-8b')) return 'Llama 3.1 8B';
  if (model.startsWith('mixtral-8x7b')) return 'Mixtral 8x7B';
  if (model.startsWith('deepseek-v4-flash')) return 'DeepSeek V4 Flash';
  if (model.startsWith('deepseek-v4-pro')) return 'DeepSeek V4 Pro';
  
  // Fallback capitalización bonita
  return model.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// ==========================================
// Custom Premium Switch Component
// ==========================================
const CustomSwitch = ({ 
  checked, 
  onChange, 
  activeColor = 'bg-[#0046ab]' 
}: { 
  checked: boolean; 
  onChange: (val: boolean) => void; 
  activeColor?: string; 
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none select-none items-center ${
        checked ? activeColor : 'bg-slate-200 dark:bg-zinc-800'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

// ==========================================
// AISettingsPanel Component
// ==========================================
function AISettingsPanel() {
    const { settings, updateProviderConfig, updateGenerationParams, setActiveProvider, updateChatAssistantEnabled, hydrateAllSettings, hasHydrated } = usePlatformSettings();
    const [showApiKey, setShowApiKey] = useState(false);
    const [showCustomApiKey, setShowCustomApiKey] = useState(false);

    const providers = (settings?.aiProviders || {}) as any;
    const aiProviders = {
        openai: { ...defaultSettings.aiProviders.openai, ...(providers.openai || {}) },
        gemini: { ...defaultSettings.aiProviders.gemini, ...(providers.gemini || {}) },
        claude: { ...defaultSettings.aiProviders.claude, ...(providers.claude || {}) },
        grok: { ...defaultSettings.aiProviders.grok, ...(providers.grok || {}) },
        groq: { ...defaultSettings.aiProviders.groq, ...(providers.groq || {}) },
        deepseek: { ...defaultSettings.aiProviders.deepseek, ...(providers.deepseek || {}) }
    };
    const activeProvider = settings.activeProvider || 'openai';
    const generationParams = settings.generationParams || defaultSettings.generationParams;

    const initialTab = visibleProviders.includes(activeProvider as AIProviderType)
        ? (activeProvider as AIProviderType)
        : 'openai';
    const [activeTab, setActiveTab] = useState<AIProviderType>(initialTab);

    const currentProvider = aiProviders[activeTab] || { 
        apiKey: '', 
        enabled: false, 
        defaultModel: '', 
        availableModels: [],
        useCustomServer: false,
        customApiKey: '',
        customBaseURL: ''
    };

    const handleSaveProvider = async () => {
        setActiveProvider(activeTab);

        try {
            await updateSiteConfig('ai_config', {
                providers: settings.aiProviders,
                activeProvider: activeTab,
                generationParams: settings.generationParams,
                isChatAssistantEnabled: settings.isChatAssistantEnabled,
                showGenerateButton: true
            });
            toast.success(`Proveedor ${providerLabels[activeTab]} configurado y guardado globalmente`);
        } catch (error) {
            console.error('Error saving AI config:', error);
            toast.warning('Guardado localmente. Error al sincronizar globalmente.');
        }
    };

    useEffect(() => {
        if (!hasHydrated) return;

        const loadGlobalConfig = async () => {
            const globalConfig = await getSiteConfig<any>('ai_config');
            if (globalConfig) {
                hydrateAllSettings(globalConfig);
            }
        };

        loadGlobalConfig();
    }, [hasHydrated]);

    useEffect(() => {
        if (activeTab === 'gemini') {
            const validModels = [
                'gemini-3.0-pro',
                'gemini-3.5-flash',
                'gemini-3.1-flash-lite',
                'gemini-2.5-pro',
                'gemini-2.5-flash',
                'gemini-2.5-flash-lite'
            ];
            if (JSON.stringify(currentProvider.availableModels) !== JSON.stringify(validModels)) {
                updateProviderConfig('gemini', { availableModels: validModels });
            }
            if (!currentProvider.useCustomServer && currentProvider.defaultModel && !validModels.includes(currentProvider.defaultModel)) {
                updateProviderConfig('gemini', { defaultModel: 'gemini-3.5-flash' });
            }
        }

        if (activeTab === 'deepseek') {
            const validModels = ['deepseek-v4-flash', 'deepseek-v4-pro'];
            if (JSON.stringify(currentProvider.availableModels) !== JSON.stringify(validModels)) {
                updateProviderConfig('deepseek', { availableModels: validModels });
            }
            if (!currentProvider.useCustomServer && currentProvider.defaultModel && !validModels.includes(currentProvider.defaultModel)) {
                updateProviderConfig('deepseek', { defaultModel: 'deepseek-v4-flash' });
            }
        }
    }, [activeTab, currentProvider.defaultModel, currentProvider.availableModels, currentProvider.useCustomServer]);

    const handleTestConnection = async () => {
        const isCustom = currentProvider.useCustomServer;
        const apiKeyToTest = isCustom ? currentProvider.customApiKey : currentProvider.apiKey;
        const customUrl = isCustom ? currentProvider.customBaseURL : "";

        if (!isCustom && !apiKeyToTest) {
            toast.error('Por favor ingresa una API Key primero');
            return;
        }
        if (isCustom && !customUrl) {
            toast.error('Por favor ingresa la URL Base Personalizada primero');
            return;
        }

        toast.info('Probando conexión...');

        try {
            let testUrl = "";
            let headers: Record<string, string> = { "Content-Type": "application/json" };
            let body: any = {};

            if (activeTab === 'gemini' && !isCustom) {
                const modelName = currentProvider.defaultModel || 'gemini-2.5-flash';
                testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKeyToTest}`;
                body = {
                    contents: [{ parts: [{ text: "Hello" }] }],
                    generationConfig: { maxOutputTokens: 5 }
                };
            } else {
                if (activeTab === 'openai') {
                    testUrl = isCustom ? customUrl : "https://api.openai.com/v1/chat/completions";
                } else if (activeTab === 'groq') {
                    testUrl = isCustom ? customUrl : "https://api.groq.com/openai/v1/chat/completions";
                } else if (activeTab === 'deepseek') {
                    testUrl = isCustom ? customUrl : "https://api.deepseek.com/v1/chat/completions";
                } else {
                    testUrl = customUrl;
                }

                if (isCustom && testUrl) {
                    let cleaned = testUrl.trim();
                    while (cleaned.endsWith('/')) {
                        cleaned = cleaned.slice(0, -1);
                    }
                    if (cleaned.toLowerCase().endsWith('/v1')) {
                        cleaned = cleaned.slice(0, -3) + '/v1';
                    }
                    if (!cleaned.endsWith('/chat/completions') && !cleaned.includes('/chat/completions?')) {
                        testUrl = `${cleaned}/chat/completions`;
                    } else {
                        testUrl = cleaned;
                    }
                }

                if (!testUrl) {
                    toast.error('Por favor ingresa la URL Base Personalizada primero');
                    return;
                }

                if (apiKeyToTest) {
                    headers["Authorization"] = `Bearer ${apiKeyToTest}`;
                }
                body = {
                    model: currentProvider.defaultModel,
                    messages: [{ role: "user", content: "Hello" }],
                    max_tokens: 5
                };
            }

            console.log("[TEST-CONNECTION] Request info:", { testUrl, headers, body });
            const response = await fetch(testUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success(`✅ Conexión exitosa a ${providerLabels[activeTab]}`);
            } else {
                const responseText = await response.text().catch(() => "");
                console.error("[TEST-CONNECTION] Failed response:", { status: response.status, text: responseText });
                let errMsg = `Código de estado: ${response.status}`;
                try {
                    const errData = JSON.parse(responseText);
                    errMsg = errData.error?.message || errData.message || errMsg;
                } catch (_) {
                    if (responseText && responseText.length < 100) {
                        errMsg = `${responseText} (${response.status})`;
                    }
                }
                toast.error(`❌ Error en conexión: ${errMsg}`);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(`❌ Error de conexión: ${error.message || 'Error de red o restricción de CORS.'}`);
        }
    };

    if (!hasHydrated) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0046ab] mx-auto mb-4"></div>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Cargando Ajustes IA...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Title compact */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-[28px] font-black text-[#1B1B1B] dark:text-zinc-100 tracking-tight leading-tight flex items-center gap-2">
                        Ajustes de Inteligencia Artificial <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />
                    </h1>
                    <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        Configura el motor pedagógico y los proveedores de IA para la plataforma
                    </p>
                </div>
                
                {/* Global Status Badges (Very Compact) */}
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-2 px-3.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 border-r border-slate-100 dark:border-zinc-850 pr-3">
                        <span className={`w-2 h-2 rounded-full ${currentProvider.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span className="text-[10px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                            Servicios AI: {currentProvider.enabled ? 'ON' : 'OFF'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${settings.isChatAssistantEnabled ? 'bg-[#0046ab] animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-[10px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                            Chatbot: {settings.isChatAssistantEnabled ? 'ON' : 'OFF'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUMNA IZQUIERDA: CONFIGURACION DE PROVEEDORES (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-5">
                        {/* Status Switchers Row */}
                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-zinc-850">
                            <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-100/50 dark:border-zinc-800 rounded-2xl">
                                <div className="min-w-0 text-left">
                                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs">Servicios de IA</h4>
                                    <p className="text-slate-400 dark:text-zinc-500 text-[10px] truncate">Habilitar en herramientas</p>
                                </div>
                                <CustomSwitch 
                                    checked={currentProvider.enabled} 
                                    onChange={(checked) => updateProviderConfig(activeTab, { enabled: checked })} 
                                    activeColor="bg-emerald-500"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-100/50 dark:border-zinc-800 rounded-2xl">
                                <div className="min-w-0 text-left">
                                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs">Asistente Chat</h4>
                                    <p className="text-slate-400 dark:text-zinc-500 text-[10px] truncate">Habilitar widget flotante</p>
                                </div>
                                <CustomSwitch 
                                    checked={!!settings.isChatAssistantEnabled} 
                                    onChange={(checked) => updateChatAssistantEnabled(checked)} 
                                    activeColor="bg-[#0046ab]"
                                />
                            </div>
                        </div>

                        {/* Proveedores Tabs */}
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block pl-1 text-left">Selecciona un Proveedor</label>
                            <div className="flex bg-slate-50 dark:bg-zinc-950 p-1.5 rounded-2xl border border-slate-100/80 dark:border-zinc-800 gap-1.5 select-none">
                                {visibleProviders.map((provider) => {
                                    const isGlobalActive = settings.activeProvider === provider;
                                    const isSelected = activeTab === provider;
                                    return (
                                        <button
                                            key={provider}
                                            type="button"
                                            onClick={() => {
                                                setActiveTab(provider);
                                                setShowApiKey(false);
                                                setShowCustomApiKey(false);
                                            }}
                                            className={`
                                                flex-1 py-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer relative
                                                ${isSelected
                                                    ? 'bg-white dark:bg-zinc-900 text-[#0046ab] dark:text-blue-400 shadow-sm border border-black/5 dark:border-white/5'
                                                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-white/40 dark:hover:bg-zinc-900/40 border border-transparent'
                                                }
                                            `}
                                        >
                                            {isGlobalActive && (
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                                            )}
                                            {providerLabels[provider]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Provider Settings Area */}
                        <div className="space-y-4 pt-2">
                            {/* Model selection & API Key */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Model selection */}
                                <div className="space-y-1.5 text-left">
                                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-zinc-300 pl-0.5">
                                        <Database size={12} className="text-slate-400" />
                                        Modelo Predeterminado
                                    </label>
                                    <Select 
                                        value={currentProvider.defaultModel} 
                                        onValueChange={(val) => updateProviderConfig(activeTab, { defaultModel: val })}
                                    >
                                        <SelectTrigger className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 h-9.5 px-3 rounded-xl shadow-2xs select-none pr-3">
                                            <SelectValue placeholder="Selecciona un modelo…">
                                                <span className="flex items-center gap-2">
                                                    <span className="font-extrabold text-xs text-slate-800 dark:text-zinc-100">
                                                        {modelDisplayName(currentProvider.defaultModel)}
                                                    </span>
                                                    {isRecommendedModel(currentProvider.defaultModel) && (
                                                        <span className="text-indigo-650 dark:text-indigo-400 text-xs select-none">★</span>
                                                    )}
                                                </span>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[260px] rounded-xl border border-neutral-200 dark:border-zinc-800 shadow-lg p-1.5 bg-white dark:bg-zinc-900 mt-1">
                                            {currentProvider.availableModels.map((model: string) => {
                                                const isSelected = currentProvider.defaultModel === model;
                                                const isRec = isRecommendedModel(model);
                                                return (
                                                    <SelectItem
                                                        key={model}
                                                        value={model}
                                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer select-none
                                                            ${isSelected 
                                                                ? 'bg-blue-50/70 dark:bg-blue-950/30' 
                                                                : 'hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex items-center justify-between w-full gap-2">
                                                            <span className="flex items-center gap-1.5 min-w-0 text-left">
                                                                <span className={`font-black truncate ${isSelected ? 'text-[#0046ab] dark:text-blue-400' : 'text-slate-750 dark:text-zinc-200'}`}>
                                                                    {modelDisplayName(model)}
                                                                </span>
                                                                {isRec && (
                                                                    <span className="text-indigo-650 dark:text-indigo-400 text-[10px] select-none ml-1">★</span>
                                                                )}
                                                            </span>
                                                            {isSelected && (
                                                                <CheckCircle size={13} className="text-[#0046ab] dark:text-blue-400 shrink-0" strokeWidth={2.2} />
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* API Key input */}
                                {!currentProvider.useCustomServer ? (
                                    <div className="space-y-1.5 text-left">
                                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-zinc-300 pl-0.5">
                                            <Key size={12} className="text-slate-400" />
                                            API Key Oficial
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showApiKey ? "text" : "password"}
                                                value={currentProvider.apiKey || ''}
                                                onChange={(e) => updateProviderConfig(activeTab, { apiKey: e.target.value })}
                                                placeholder={`Ingresa tu API Key de ${providerLabels[activeTab]}`}
                                                className="w-full h-9.5 pl-3.5 pr-10 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-[#0046ab]/20 focus:border-[#0046ab] transition-all placeholder:text-neutral-400 font-mono text-xs dark:text-zinc-200 shadow-2xs outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowApiKey(!showApiKey)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer flex items-center justify-center"
                                            >
                                                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center bg-indigo-50/20 dark:bg-indigo-950/10 border border-dashed border-indigo-150 dark:border-indigo-900/30 rounded-xl p-3 text-[10px] text-indigo-650 dark:text-indigo-400 font-bold text-center mt-4">
                                        Servidor Propio Activo. API Key oficial omitida.
                                    </div>
                                )}
                            </div>

                            {/* Self hosted server toggle (Super compact) */}
                            <div className="p-3 bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/40 dark:border-amber-900/20 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-8 h-8 rounded-full bg-amber-100/60 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                        <Server size={14} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-zinc-200">Servidor Auto-hospedado (Self-hosted)</h4>
                                        <p className="text-[9.5px] text-slate-400 dark:text-zinc-500">Redirige a Ollama, LocalAI, vLLM, LiteLLM, etc.</p>
                                    </div>
                                </div>
                                <CustomSwitch
                                    checked={currentProvider.useCustomServer || false}
                                    onChange={(checked) => {
                                        const updates: any = { useCustomServer: checked };
                                        if (activeTab === 'gemini') {
                                            updates.defaultModel = 'gemini-3.5-flash';
                                        }
                                        updateProviderConfig(activeTab, updates);
                                    }}
                                    activeColor="bg-amber-500"
                                />
                            </div>

                            {/* Conditional Custom Server Fields */}
                            {currentProvider.useCustomServer && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/30 dark:bg-zinc-950/10 border border-slate-100/60 dark:border-zinc-800/60 rounded-2xl animate-in slide-in-from-top-2 duration-250">
                                    <div className="space-y-1.5 text-left">
                                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-zinc-300 pl-0.5">
                                            <Key size={12} className="text-slate-400" />
                                            API Key del Servidor Propio
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showCustomApiKey ? "text" : "password"}
                                                value={currentProvider.customApiKey || ''}
                                                onChange={(e) => updateProviderConfig(activeTab, { customApiKey: e.target.value })}
                                                placeholder="Ingresa la API Key del servidor"
                                                className="w-full h-9.5 pl-3.5 pr-10 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-[#0046ab]/20 focus:border-[#0046ab] transition-all placeholder:text-neutral-400 font-mono text-xs dark:text-zinc-250 shadow-2xs outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCustomApiKey(!showCustomApiKey)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer flex items-center justify-center"
                                            >
                                                {showCustomApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 text-left">
                                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-zinc-300 pl-0.5">
                                            <Settings size={12} className="text-slate-400" />
                                            URL Base Personalizada
                                        </label>
                                        <Input
                                            type="text"
                                            value={currentProvider.customBaseURL || ''}
                                            onChange={(e) => updateProviderConfig(activeTab, { customBaseURL: e.target.value })}
                                            placeholder="Ej: http://localhost:8000/v1"
                                            className="w-full h-9.5 px-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-[#0046ab]/20 focus:border-[#0046ab] transition-all placeholder:text-neutral-400 font-mono text-xs dark:text-zinc-200 shadow-2xs outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions (Connection test and Save) */}
                        <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-zinc-850">
                            <button
                                type="button"
                                onClick={handleTestConnection}
                                disabled={currentProvider.useCustomServer ? !currentProvider.customBaseURL : !currentProvider.apiKey}
                                className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-all font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                                <Zap size={13} className="text-amber-500 fill-amber-500/20" />
                                Probar Conexión
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveProvider}
                                disabled={!currentProvider.enabled || (currentProvider.useCustomServer ? !currentProvider.customBaseURL : !currentProvider.apiKey)}
                                className="flex-1 h-9 rounded-xl bg-[#0046ab] hover:bg-[#003685] text-white disabled:opacity-50 transition-all font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[#0046ab]/15 border-none"
                            >
                                <CheckCircle size={13} />
                                Activar Proveedor
                            </button>
                        </div>
                    </Card>
                </div>

                {/* COLUMNA DERECHA: PARAMETROS PEDAGÓGICOS & STATUS (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Compact Params Card */}
                    <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-5">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-850">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/10 text-purple-650 dark:bg-purple-500/20 dark:text-purple-400">
                                <Sliders size={14} />
                            </div>
                            <h3 className="font-extrabold text-slate-800 dark:text-zinc-150 text-xs uppercase tracking-wide text-left">Ajustes Generación</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Temperature Slider */}
                            <div className="space-y-2 text-left">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-bold text-slate-750 dark:text-zinc-300">Creatividad (Temperatura)</label>
                                    <span className="bg-[#0046ab]/10 text-[#0046ab] dark:bg-blue-950/50 dark:text-blue-400 px-2 py-0.5 rounded-lg text-[10px] font-black">{generationParams.temperature}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1.5"
                                    step="0.1"
                                    value={generationParams.temperature}
                                    onChange={(e) => updateGenerationParams({ temperature: parseFloat(e.target.value) })}
                                    className="w-full h-1 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#0046ab] hover:accent-[#003685] transition-all"
                                />
                            </div>

                            {/* Token limit */}
                            <div className="space-y-2 text-left">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-bold text-slate-750 dark:text-zinc-300">Límite de Tokens Máximos</label>
                                    <span className="bg-[#0046ab]/10 text-[#0046ab] dark:bg-blue-950/50 dark:text-blue-400 px-2 py-0.5 rounded-lg text-[10px] font-black">{generationParams.maxTokens}</span>
                                </div>
                                <input
                                    type="range"
                                    min="200"
                                    max="4000"
                                    step="100"
                                    value={generationParams.maxTokens}
                                    onChange={(e) => updateGenerationParams({ maxTokens: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#0046ab] hover:accent-[#003685] transition-all"
                                />
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block pt-0.5">
                                    * {generationParams.maxTokens} tokens = aprox. {Math.round(generationParams.maxTokens * 0.75)} palabras.
                                </span>
                            </div>

                            {/* Penalties Grid */}
                            <div className="grid grid-cols-2 gap-4 pt-1">
                                <div className="space-y-2 text-left">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-slate-500">Frecuencia</label>
                                        <span className="text-[10px] font-black text-[#0046ab] dark:text-blue-400">{generationParams.frequencyPenalty}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={generationParams.frequencyPenalty}
                                        onChange={(e) => updateGenerationParams({ frequencyPenalty: parseFloat(e.target.value) })}
                                        className="w-full h-1 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#0046ab]"
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-slate-500">Presencia</label>
                                        <span className="text-[10px] font-black text-emerald-500">{generationParams.presencePenalty}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={generationParams.presencePenalty}
                                        onChange={(e) => updateGenerationParams({ presencePenalty: parseFloat(e.target.value) })}
                                        className="w-full h-1 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Compact Widget: Active Motor Overview */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-md shadow-indigo-600/15 border border-transparent dark:border-white/5 space-y-4 text-left">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/15 text-white shrink-0">
                                <Shield size={14} className="fill-white/10" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-xs text-white">Motor de Inteligencia Activo</h4>
                                <p className="text-[9.5px] text-white/70">Planix utiliza este modelo para la generación</p>
                            </div>
                        </div>

                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[9.5px] font-black uppercase tracking-wider text-white/80">Proveedor</span>
                                <span className="text-xs font-black bg-white/25 px-2 py-0.5 rounded-md">{providerLabels[activeProvider]}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[9.5px] font-black uppercase tracking-wider text-white/80">Modelo</span>
                                <span className="text-xs font-mono font-bold max-w-[170px] truncate text-right text-white" title={aiProviders[activeProvider]?.defaultModel}>
                                    {aiProviders[activeProvider]?.defaultModel}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                <span className="text-[9.5px] font-black uppercase tracking-wider text-white/80">Servidor</span>
                                <span className="text-xs font-black text-amber-300">
                                    {aiProviders[activeProvider]?.useCustomServer ? 'Auto-hospedado' : 'API Oficial'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// ==========================================
// Main Admin Component
// ==========================================
export default function Admin() {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.rol !== 'admin') {
      toast.error('Acceso denegado: Se requieren privilegios de administrador.');
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.rol !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-neutral-100 dark:border-zinc-800 shadow-xl max-w-sm w-full mx-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-zinc-100">Verificando Credenciales</h3>
          <p className="text-xs text-neutral-500 dark:text-zinc-400">Verificando rol de administrador para esta sesión...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    supabase.auth.signOut();
    localStorage.removeItem('plx:user');
    localStorage.removeItem('plx:session');
    toast.success("👋 Sesión cerrada correctamente.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-zinc-950 text-neutral-800 dark:text-zinc-200 flex flex-col p-4 md:p-6 gap-6 relative select-none">
      {/* Top Header Navigation */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-zinc-900 px-6 py-5 rounded-[28px] border border-black/5 dark:border-zinc-800 shadow-xs gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            Configuración de IA
            <span className="text-[10px] font-black uppercase bg-[#0046ab]/10 text-[#0046ab] dark:bg-blue-950/30 dark:text-blue-400 border border-[#0046ab]/10 px-2.5 py-0.5 rounded-full tracking-wider">
              Ajustes
            </span>
          </h1>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">
            Panel de administración del motor pedagógico
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 rounded-2xl bg-[#0046ab] hover:bg-[#003c94] active:scale-[0.99] text-white py-2.5 px-5 text-xs font-black shadow-sm hover:shadow-md transition-all cursor-pointer outline-hidden"
        >
          <ArrowLeft size={14} className="text-white" />
          Volver al Panel de Administración
        </button>
      </div>

      {/* Área de Contenido Principal */}
      <main className="w-full max-w-7xl mx-auto py-2">
        <AISettingsPanel />
      </main>
    </div>
  );
}
