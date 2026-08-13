import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRequireAuth } from "../lib/useRequireAuth";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { saveUsuario, logout } from "../lib/storage";
import {
  ShieldCheck, CreditCard, User, GraduationCap, Lock, Trash2, Eye, EyeOff,
  AlertTriangle, Crown, ImageIcon, User2, Shield, Mail, Key, Layers, Award, BookOpen, Home, MapPin, Globe, Check,
  Landmark, X, Info, ChevronRight, Copy, Sparkles, RefreshCw, ArrowLeft, Clock, AlertCircle, Smile, FileText, LayoutGrid, Users,
  Pencil, ExternalLink
} from "lucide-react";
import { toast, Toaster } from "sonner";
import AmbassadorBadge from "../components/ui/AmbassadorBadge";
import MedalStar from "../components/ui/MedalStar";
import TeacherAvatarEditor from "../components/planix/TeacherAvatarEditor";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { requestD1 } from "../lib/services/d1Client";
import { fetchProfile } from "../lib/services/auth";
import { getUserCredits } from "../lib/credits";

// PageHeader component defined locally for layout consistency
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl text-[#1B1B1B] dark:text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 font-semibold">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export default function Perfil() {
  const user = useRequireAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [colegio, setColegio] = useState(user?.colegio || "");
  const [metodoAcceso, setMetodoAcceso] = useState<"google" | "correo">("correo");
  const [copiedReferral, setCopiedReferral] = useState(false);

  const handleCopyLink = () => {
    if (!user) return;
    const referralCode = user.referral_code || '';
    const referralLink = `${window.location.origin}/registro?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    toast.success('¡Enlace de referido copiado al portapapeles!');
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  // Avatar states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(user?.avatar_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync avatar if user session updates
  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setColegio(user.colegio || "");
      setPreviewPhotoUrl(user.avatar_url || null);
    }
  }, [user]);

  useEffect(() => {
    async function checkProvider() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const provider = data.user.app_metadata?.provider || data.user.app_metadata?.providers?.[0];
        const isGoogle = provider === "google" || data.user.identities?.some(id => id.provider === "google");
        setMetodoAcceso(isGoogle ? "google" : "correo");
      }
    }
    checkProvider();
  }, [user]);

  // Sync latest user profile on load (for credits/referral code)
  useEffect(() => {
    if (!user) return;
    async function syncProfile() {
      try {
        const latestProfile = await fetchProfile(user.id);
        if (latestProfile) {
          saveUsuario(latestProfile);
        }
      } catch (err) {
        console.error("Error syncing profile on load:", err);
      }
    }
    syncProfile();
  }, [user?.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato no válido. Solo JPG, PNG, WebP o GIF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen es muy grande (Máx 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for WebP conversion and compression
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Estandarizar a 512x512 cuadrado (ideal para foto de perfil)
        const size = 512;
        canvas.width = size;
        canvas.height = size;

        if (ctx) {
          // Crop and center logic
          const sourceWidth = img.width;
          const sourceHeight = img.height;
          const minSource = Math.min(sourceWidth, sourceHeight);
          const sx = (sourceWidth - minSource) / 2;
          const sy = (sourceHeight - minSource) / 2;

          ctx.drawImage(img, sx, sy, minSource, minSource, 0, 0, size, size);

          // Compresion y conversion a WEBP (80% calidad)
          const webpBase64 = canvas.toDataURL("image/webp", 0.8);

          setPreviewPhotoUrl(webpBase64);
          saveUsuario({
            ...user!,
            avatar_url: webpBase64,
          });

          // Save to D1 in background
          requestD1("/api/profiles", "POST", {
            id: user.id,
            avatar_url: webpBase64
          }).catch((err) => console.warn("Could not save avatar to D1:", err));

          toast.success("Foto de perfil optimizada y guardada en WebP.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async (url: string) => {
    setPreviewPhotoUrl(url);
    saveUsuario({
      ...user!,
      avatar_url: url,
    });

    try {
      await requestD1("/api/profiles", "POST", {
        id: user.id,
        avatar_url: url
      });
    } catch (err) {
      console.error("Could not save avatar to D1:", err);
    }

    toast.success("Avatar guardado con éxito.");
    setIsEditorOpen(false);
  };

  // Subscription modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalStep, setModalStep] = useState<'select' | 'confirm_card' | 'bank' | 'waiting_polar'>('select');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [loadingPolarPortal, setLoadingPolarPortal] = useState(false);

  // Effect to poll subscription status from D1 when waiting for Polar payment
  useEffect(() => {
    if (modalStep !== 'waiting_polar' || !user || !showUpgradeModal) return;

    const intervalId = setInterval(async () => {
      try {
        const profile = await fetchProfile(user.id);
        if (profile && profile.suscripcion === 'pro') {
          saveUsuario(profile);
          toast.success('¡Suscripción Pro activada con éxito!');
          clearInterval(intervalId);
          setShowUpgradeModal(false);
          navigate('/suscripcion/exito?type=polar');
        }
      } catch (err) {
        console.error("Error polling profile subscription status:", err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [modalStep, user, navigate, showUpgradeModal]);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Password strength checker
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { percent: 0, label: "", color: "", barColor: "" };
    let score = 0;
    if (newPassword.length >= 8) score += 25;
    if (newPassword.length >= 12) score += 15;
    if (/[A-Z]/.test(newPassword)) score += 20;
    if (/[0-9]/.test(newPassword)) score += 20;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 20;

    if (score < 40) return { percent: score, label: "Muy débil ❌", color: "text-red-500", barColor: "bg-red-500" };
    if (score < 70) return { percent: score, label: "Aceptable ⚠️", color: "text-amber-500", barColor: "bg-amber-500" };
    return { percent: score, label: "Fuerte y Segura 💪", color: "text-emerald-500", barColor: "bg-emerald-500" };
  }, [newPassword]);

  if (!user) return null;

  function formatAcademicValue(val?: string) {
    if (!val) return "No definido";
    let formatted = val.toLowerCase();

    // Cycle replacements
    if (formatted.includes("ciclo1")) return "1er Ciclo";
    if (formatted.includes("ciclo2")) return "2do Ciclo";
    if (formatted.includes("ciclo3")) return "3er Ciclo";

    // Grade replacements
    formatted = formatted
      .replace("primaria-1ro", "1er Grado")
      .replace("primaria-2do", "2do Grado")
      .replace("primaria-3ro", "3er Grado")
      .replace("primaria-4to", "4to Grado")
      .replace("primaria-5to", "5to Grado")
      .replace("primaria-6to", "6to Grado")
      .replace("secundaria-1ro", "1er Grado")
      .replace("secundaria-2do", "2do Grado")
      .replace("secundaria-3ro", "3er Grado")
      .replace("secundaria-4to", "4to Grado")
      .replace("secundaria-5to", "5to Grado")
      .replace("secundaria-6to", "6to Grado");

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  // Update password handler — integrado con Supabase Auth + D1
  async function handleSavePassword() {
    if (!user) return;

    // Validaciones locales
    if (!currentPassword) {
      toast.error("Debes ingresar tu contraseña actual.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("La nueva contraseña debe ser diferente a la actual.");
      return;
    }

    setIsChangingPassword(true);
    try {
      // Paso 1: Verificar contraseña actual re-autenticando con Supabase
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("La contraseña actual es incorrecta.");
        return;
      }

      // Paso 2: Actualizar contraseña en Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(`Error al actualizar: ${updateError.message}`);
        return;
      }

      // Paso 3: Actualizar en almacenamiento local
      saveUsuario({ ...user!, password: newPassword });

      // Paso 4: Sincronizar con la base de datos D1
      try {
        await requestD1(`/api/profiles/${user.id}/password`, "PUT", {
          password_hash: newPassword,
        });
      } catch (d1Err) {
        console.error("Error syncing password to D1:", d1Err);
      }

      toast.success("¡Contraseña actualizada correctamente!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  // Delete account handler — sincronizado con D1
  async function handleDeleteAccount() {
    if (deleteConfirmation !== "ELIMINAR MI CUENTA") {
      toast.error("Por favor escribe exactamente 'ELIMINAR MI CUENTA' para confirmar.");
      return;
    }

    setDeleting(true);
    try {
      // Paso 1: Eliminar todos los datos del usuario en D1 (cascade)
      await requestD1(`/api/profiles/${user!.id}`, "DELETE");

      // Paso 2: Cerrar sesión local y limpiar localStorage
      logout();

      toast.success("Tu cuenta ha sido eliminada permanentemente de todos los servidores. Esperamos verte pronto.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      console.error("Error deleting account from D1:", err);
      // Aún así eliminar localmente como fallback
      logout();
      toast.success("Tu cuenta ha sido eliminada. Esperamos verte pronto.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }

  async function handleSaveSettings() {
    if (!user) return;
    const updated = {
      ...user!,
      nombre,
      colegio,
    };
    saveUsuario(updated);

    try {
      await requestD1("/api/profiles", "POST", {
        id: user.id,
        full_name: nombre,
        school_name: colegio
      });
    } catch (err) {
      console.error("Could not save settings to D1:", err);
    }

    toast.success("¡Configuración del perfil escolar guardada con éxito!");
  }



  // Manual check function for waiting screen
  const verifyPaymentImmediately = async () => {
    if (!user) return;
    const loadingToast = toast.loading('Verificando pago con Polar...');
    try {
      const profile = await fetchProfile(user.id);
      if (profile && profile.suscripcion === 'pro') {
        saveUsuario(profile);
        toast.success('¡Suscripción Pro activada con éxito!', { id: loadingToast });
        setShowUpgradeModal(false);
        navigate('/suscripcion/exito?type=polar');
      } else {
        toast.error('El pago aún no ha sido confirmado. Por favor, asegúrese de completar el pago en Polar.', { id: loadingToast });
      }
    } catch (err) {
      console.error("Error manual verification of profile status:", err);
      toast.error('Error al verificar. Intenta de nuevo.', { id: loadingToast });
    }
  };

  const handleOpenPolarPortal = async () => {
    if (!user?.email) return;
    setLoadingPolarPortal(true);
    const loadingToast = toast.loading("Conectando con el portal de cliente de Polar.sh...");

    try {
      const res = await requestD1<{ url: string }>("/api/polar/portal-session", "POST", {
        email: user.email,
      });
      toast.dismiss(loadingToast);
      if (res && res.url) {
        window.open(res.url, "_blank");
      } else {
        window.open(`https://polar.sh/planix/portal?customer_email=${encodeURIComponent(user.email)}`, "_blank");
      }
    } catch (err) {
      console.error("Error opening Polar portal:", err);
      toast.dismiss(loadingToast);
      window.open(`https://polar.sh/planix/portal?customer_email=${encodeURIComponent(user.email)}`, "_blank");
    } finally {
      setLoadingPolarPortal(false);
    }
  };

  const handleCheckoutPolar = async () => {
    if (!user) return;
    setProcessingPayment(true);
    setModalStep('waiting_polar');

    let checkoutUrl = '';

    try {
      // Check for Next.js endpoint or custom API env (fallback to 3001 in dev)
      const apiBase = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');
      const response = await fetch(`${apiBase}/api/checkout/polar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: import.meta.env.VITE_POLAR_PRODUCT_ID,
          plan_id: 'pro',
          user_id: user.id,
          user_email: user.email
        })
      });

      let data: any = {};
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error('Failed to parse checkout response text:', text);
        if (response.status === 404) {
          throw new Error('El servidor de pagos (Next.js) no está corriendo o no se encuentra en el puerto esperado.');
        }
        throw new Error(`Error del servidor (${response.status}): respuesta no válida.`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar el pago con tarjeta');
      }

      if (data.url) {
        checkoutUrl = data.url;
      } else {
        throw new Error('No se recibió la URL de pago desde Polar');
      }
    } catch (error: any) {
      console.warn('Backend checkout API failed/not running, trying direct Polar checkout link:', error);
      try {
        // Direct checkout fallback URL using Polar client-side pattern
        const baseUrl = "https://buy.polar.sh/polar_cl_oyQIPzYXQTmTZ1FyiYUvxv0J0Ow1tkAg4vkCH3COaPA";
        const urlWithMetadata = new URL(baseUrl);

        if (user?.id) {
          urlWithMetadata.searchParams.append('checkout_metadata[user_id]', user.id);
        }
        urlWithMetadata.searchParams.append('checkout_metadata[plan_id]', 'pro');
        if (user?.email) {
          urlWithMetadata.searchParams.append('customer_email', user.email);
        }

        checkoutUrl = urlWithMetadata.toString();
      } catch (fallbackErr) {
        console.error('Fallback checkout redirect error:', fallbackErr);
        toast.error('No se pudo iniciar el proceso de pago. Por favor, intenta de nuevo o selecciona transferencia.');
      }
    } finally {
      setProcessingPayment(false);
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
        toast.info('Redirigiendo al portal de pago seguro en una nueva pestaña...');
      }
    }
  };

  const handleCheckoutBank = () => {
    setModalStep('bank');
  };

  return (
    <div className="flex-1 flex flex-col pt-10 xl:pt-[44px] px-6 md:px-[60px] xl:px-16 w-full min-w-0 pb-12">
      <Toaster position="top-center" richColors />

      <PageHeader
        title="Configuración de Cuenta"
        description="Gestiona tus datos de perfil docente, preferencias del sistema y pasarela de facturación escolar."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-none relative overflow-hidden group">
            {/* Top Cover Banner */}
            <div className="h-24 bg-gradient-to-r from-[#0046ab]/10 via-[#0046ab]/5 to-transparent dark:from-blue-950/35 dark:via-indigo-950/20 dark:to-transparent w-full absolute top-0 left-0 z-0 border-b border-neutral-100 dark:border-zinc-800/50" />

            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap border-b border-neutral-100 dark:border-zinc-800/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-950/40 text-[#0046ab] dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 fill-blue-500/20 text-[#0046ab] dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base text-[#0046ab] dark:text-blue-450">
                      Detalles de Perfil Docente
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                      Actualiza tu firma de planes y nombre visible.
                    </p>
                  </div>
                </div>

                {/* Credits badge displaying user credits */}
                <div className="bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700/80 rounded-2xl px-4 py-2 flex items-center gap-2.5 shrink-0 shadow-3xs select-none">
                  <img 
                    src="/creditos.webp" 
                    alt="Créditos" 
                    className="w-8 h-8 object-contain shrink-0" 
                    onError={(e) => {
                      // fallback to emoji if image fails to load
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[17px] font-black text-slate-800 dark:text-zinc-100 leading-tight">
                      {user.suscripcion === "pro" || user.rol === "admin" ? "Ilimitado" : getUserCredits(user)}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-400 leading-none">
                      Planix Coins
                    </span>
                  </div>
                </div>
              </div>

              {/* AVATAR HEADER SECTION */}
              <div className="flex flex-col items-center justify-center pt-8 pb-2">
                {/* Circular Frame */}
                <div className="relative group mb-4">
                  <div className={`w-28 h-28 rounded-full p-[3px] relative z-10 ${user.is_ambassador || user.suscripcion === "pro"
                      ? "bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.45)]"
                      : "bg-gradient-to-tr from-[#0046ab] via-purple-500 to-indigo-600"
                    }`}>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full rounded-full bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center relative cursor-pointer group/avatar"
                    >
                      {previewPhotoUrl ? (
                        <img
                          src={previewPhotoUrl}
                          alt={nombre}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="text-2xl font-bold text-slate-400">
                          {nombre.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white">
                        <ImageIcon className="h-5 w-5 mb-1 text-white" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Subir Foto</span>
                      </div>
                    </div>

                    {/* Premium/Crown/Ambassador badge inside avatar ring */}
                    {user.is_ambassador ? (
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900 transition-transform flex items-center justify-center shadow-md">
                        <MedalStar size={14} className="text-white" />
                      </div>
                    ) : user.suscripcion === "pro" ? (
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900 transition-transform">
                        <Crown className="h-3.5 w-3.5 fill-white text-white" />
                      </div>
                    ) : null}

                    {/* Create Avatar Badge symmetrically on the bottom-left */}
                    <button
                      type="button"
                      onClick={() => setIsEditorOpen(true)}
                      className="absolute -bottom-1 -left-1 bg-[#0046ab] hover:bg-blue-700 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900 transition-all active:scale-90 hover:scale-110 cursor-pointer z-20"
                      title="Crear Avatar Planix"
                    >
                      <User2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Role and Subscription Badges */}
                <div className="text-center space-y-2 mt-2">
                  <h4 className="text-base font-extrabold text-[#1B1B1B] dark:text-white tracking-tight">{nombre}</h4>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    {user.is_ambassador && (
                      <AmbassadorBadge size="sm" showPlanixText={true} />
                    )}
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-blue-500/10 text-[#0046ab] dark:text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {user.rol === "admin"
                          ? "Administrador"
                          : user.rol === "coordinator"
                            ? "Coordinador"
                            : user.rol === "director"
                              ? "Director"
                              : "Docente"}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${user.suscripcion === "pro"
                          ? "bg-gradient-to-tr from-amber-400/15 via-orange-500/10 to-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                          : "bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        }`}>
                        {user.suscripcion === "pro" ? "Planix Pro ✨" : "Plan Gratuito"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tarjeta de Referidos Horizontal */}
          <Card className="p-3.5 bg-gradient-to-r from-[#0046ab]/10 via-[#0046ab]/5 to-transparent dark:from-blue-955/20 dark:via-blue-955/10 dark:to-transparent border border-[#0046ab]/20 dark:border-[#0046ab]/10 rounded-[20px] relative overflow-hidden text-left flex flex-col gap-2.5 shadow-none">
            {/* Row 1: Info (Icon + Title + Description) */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0046ab]/20 dark:bg-blue-955/40 rounded-full flex items-center justify-center shrink-0 text-[#0046ab] dark:text-blue-400 shadow-3xs">
                <Users size={14} />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-display font-extrabold text-[13px] md:text-sm text-[#0046ab] dark:text-blue-300 leading-tight">
                  Invita a Colegas y Gana Planix Coins
                </h3>
                <p className="text-[10px] md:text-[11px] text-neutral-600 dark:text-neutral-450 font-semibold leading-tight">
                  Comparte tu enlace y ganen Planix Coins al instante cuando se registren.
                </p>
              </div>
            </div>

            {/* Row 2: Link Copy Box & Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/50 dark:border-zinc-800/50">
              {/* Unified Link Box & Copy Button */}
              <div className="flex-1 flex items-center bg-white dark:bg-zinc-955 border border-neutral-200 dark:border-zinc-850 rounded-lg overflow-hidden h-8 pl-3 pr-1">
                <span className="flex-1 text-[10px] font-mono font-bold text-neutral-600 dark:text-zinc-450 truncate select-all mr-2">
                  {`${window.location.origin}/registro?ref=${user.referral_code || ''}`}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="bg-[#1B1B1B] hover:bg-[#2A2A2A] dark:bg-zinc-100 dark:hover:bg-white dark:text-neutral-900 text-white font-extrabold text-[9.5px] px-2.5 h-6 rounded-md flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98] select-none shrink-0 border-none"
                >
                  {copiedReferral ? <Check size={10} className="text-emerald-500" strokeWidth={3.5} /> : <Copy size={10} />}
                  {copiedReferral ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              {/* Ver Referidos Button */}
              <button
                onClick={() => navigate("/referidos")}
                className="bg-[#0046ab] hover:bg-blue-700 text-white font-extrabold text-[10px] px-3 h-8 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98] select-none shrink-0 border-none"
              >
                <Sparkles size={11} />
                Ver Referidos
              </button>
            </div>
          </Card>

          {/* Centro Educativo Card */}
          <Card className="p-5 border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 relative overflow-hidden transition-all duration-300 rounded-[28px] group shadow-none">
            {/* Subtle giant background icon */}
            <div className="absolute right-[-10px] top-[-10px] text-[#0046ab]/5 opacity-[0.03] pointer-events-none group-hover:scale-105 transition-transform duration-500">
              <svg className="w-36 h-36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M3 21h18M5 21V11.5L12 4l7 7.5V21M9 21v-4a3 3 0 016 0v4M12 11h.01M9 11h.01M15 11h.01" />
              </svg>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-950/40 text-[#0046ab] dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                <Home className="h-5 w-5 fill-blue-500/20 text-[#0046ab] dark:text-blue-400" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#0046ab] dark:text-blue-450 uppercase tracking-wider block">
                  CENTRO EDUCATIVO
                </span>
                <h3 className="font-display font-bold text-base text-[#1B1B1B] dark:text-white mt-0.5 uppercase tracking-tight">
                  {colegio || "Sin Registrar"}
                </h3>
              </div>
            </div>

            {/* Grid of regional information cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Regional Card */}
              <div className="bg-gradient-to-br from-[#E0E7FF] to-[#EDE9FE] dark:from-indigo-950/20 dark:to-slate-900 rounded-[20px] p-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 min-h-[115px] flex flex-col justify-between border border-transparent hover:border-indigo-500/10 select-none text-left">
                <div className="flex justify-between items-start relative z-10 w-full">
                  <div className="flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                    <span className="text-[11px] font-bold uppercase tracking-wider">REGIONAL</span>
                  </div>
                  <div className="w-8 h-8 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-indigo-655 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                  </div>
                </div>
                <div className="relative z-10 my-2 flex flex-col items-start w-full">
                  <span className="text-[16px] font-extrabold text-[#1B1B1B] dark:text-white leading-tight truncate w-full">
                    {user.regional || "No definido"}
                  </span>
                </div>
                <div className="relative z-10 mt-auto flex items-center justify-between pt-2 border-t border-indigo-500/10 w-full">
                  <span className="text-[9.5px] font-bold text-[#1B1B1B]/40 dark:text-slate-400 uppercase tracking-wider">Mapeo</span>
                  <span className="text-[9.5px] font-black uppercase text-indigo-655 dark:text-indigo-400 bg-white/70 dark:bg-black/30 px-1.5 py-0.5 rounded-md border border-indigo-200/50">
                    TERRITORIAL
                  </span>
                </div>
              </div>

              {/* Distrito Card */}
              <div className="bg-gradient-to-br from-[#E6F4EA] to-[#F1F9F5] dark:from-emerald-950/20 dark:to-slate-900 rounded-[20px] p-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 min-h-[115px] flex flex-col justify-between border border-transparent hover:border-emerald-500/10 select-none text-left">
                <div className="flex justify-between items-start relative z-10 w-full">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-[11px] font-bold uppercase tracking-wider">DISTRITO</span>
                  </div>
                  <div className="w-8 h-8 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                </div>
                <div className="relative z-10 my-2 flex flex-col items-start w-full">
                  <span className="text-[16px] font-extrabold text-[#1B1B1B] dark:text-white leading-tight truncate w-full">
                    {user.distrito || "No definido"}
                  </span>
                </div>
                <div className="relative z-10 mt-auto flex items-center justify-between pt-2 border-t border-emerald-500/10 w-full">
                  <span className="text-[9.5px] font-bold text-[#1B1B1B]/40 dark:text-slate-400 uppercase tracking-wider">Jurisdicción</span>
                  <span className="text-[9.5px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-white/70 dark:bg-black/30 px-1.5 py-0.5 rounded-md border border-emerald-200/50">
                    EDUCATIVO
                  </span>
                </div>
              </div>

              {/* Municipio Card */}
              <div className="bg-gradient-to-br from-[#FFF4E0] to-[#FFE4E1] dark:from-amber-950/20 dark:to-slate-900 rounded-[20px] p-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 min-h-[115px] flex flex-col justify-between border border-transparent hover:border-orange-500/10 select-none text-left">
                <div className="flex justify-between items-start relative z-10 w-full">
                  <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4 10 15.3 15.3 0 014-10z" />
                    </svg>
                    <span className="text-[11px] font-bold uppercase tracking-wider">MUNICIPIO</span>
                  </div>
                  <div className="w-8 h-8 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4 10 15.3 15.3 0 014-10z" />
                    </svg>
                  </div>
                </div>
                <div className="relative z-10 my-2 flex flex-col items-start w-full">
                  <span className="text-[16px] font-extrabold text-[#1B1B1B] dark:text-white leading-tight truncate w-full">
                    {user.municipio || "No definido"}
                  </span>
                </div>
                <div className="relative z-10 mt-auto flex items-center justify-between pt-2 border-t border-orange-500/10 w-full">
                  <span className="text-[9.5px] font-bold text-[#1B1B1B]/40 dark:text-slate-400 uppercase tracking-wider">Área</span>
                  <span className="text-[9.5px] font-black uppercase text-orange-600 dark:text-orange-400 bg-white/70 dark:bg-black/30 px-1.5 py-0.5 rounded-md border border-orange-200/50">
                    LOCALIDAD
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Academic Information */}
          {user.rol !== "coordinator" && (
            <Card className="p-5 border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 relative overflow-hidden transition-all duration-300 rounded-[28px] group shadow-none">
              {/* Subtle background decoration */}
              <div className="absolute right-[-10px] top-[-10px] text-[#0046ab]/5 opacity-[0.02] pointer-events-none group-hover:scale-105 transition-transform duration-500">
                <GraduationCap className="w-36 h-36" />
              </div>

              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap sm:flex-nowrap w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-950/40 text-[#0046ab] dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 fill-blue-500/20 text-[#0046ab] dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[#0046ab] dark:text-blue-455 uppercase tracking-wider block">
                      INFORMACIÓN ACADÉMICA
                    </span>
                    <h3 className="font-display font-bold text-base text-[#1B1B1B] dark:text-white mt-0.5 tracking-tight">
                      Configuración de Enseñanza Principal
                    </h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Nivel Educativo Card */}
                <div className="bg-gradient-to-br from-[#E0F2FE] to-[#F0F9FF] dark:from-sky-950/20 dark:to-slate-900 rounded-[20px] p-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 min-h-[115px] flex flex-col justify-between border border-transparent hover:border-sky-500/10 select-none text-left">
                  <div className="flex justify-between items-start relative z-10 w-full">
                    <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">NIVEL EDUCATIVO</span>
                    </div>
                    <div className="w-8 h-8 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="relative z-10 my-2 flex flex-col items-start w-full">
                    <span className="text-[16px] font-extrabold text-[#1B1B1B] dark:text-white leading-tight truncate capitalize w-full">
                      {user.nivel || "No definido"}
                    </span>
                  </div>
                  <div className="relative z-10 mt-auto flex items-center justify-between pt-2 border-t border-sky-500/10 w-full">
                    <span className="text-[9.5px] font-bold text-[#1B1B1B]/40 dark:text-slate-400 uppercase tracking-wider">Nivel</span>
                    <span className="text-[9.5px] font-black uppercase text-sky-655 dark:text-sky-400 bg-white/70 dark:bg-black/30 px-1.5 py-0.5 rounded-md border border-sky-200/50">
                      ACADÉMICO
                    </span>
                  </div>
                </div>

                {/* Ciclo Card */}
                <div className="bg-gradient-to-br from-[#F3E8FF] to-[#FAEDFF] dark:from-purple-950/20 dark:to-slate-900 rounded-[20px] p-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 min-h-[115px] flex flex-col justify-between border border-transparent hover:border-purple-500/10 select-none text-left">
                  <div className="flex justify-between items-start relative z-10 w-full">
                    <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                      <Layers className="h-4 w-4" />
                      <span className="text-[13px] font-bold uppercase tracking-wider">CICLO</span>
                    </div>
                    <div className="w-8 h-8 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                      <Layers className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="relative z-10 my-2 flex flex-col items-start w-full">
                    <span className="text-[16px] font-extrabold text-[#1B1B1B] dark:text-white leading-tight truncate w-full">
                      {formatAcademicValue(user.ciclo)}
                    </span>
                  </div>
                  <div className="relative z-10 mt-auto flex items-center justify-between pt-2 border-t border-purple-500/10 w-full">
                    <span className="text-[9.5px] font-bold text-[#1B1B1B]/40 dark:text-slate-400 uppercase tracking-wider">Etapa</span>
                    <span className="text-[9.5px] font-black uppercase text-purple-600 dark:text-purple-400 bg-white/70 dark:bg-black/30 px-1.5 py-0.5 rounded-md border border-purple-200/50">
                      PEDAGÓGICO
                    </span>
                  </div>
                </div>

                {/* Grado Asignado Card */}
                <div className="bg-gradient-to-br from-[#FCE8E6] to-[#FEF3F2] dark:from-rose-950/20 dark:to-slate-900 rounded-[20px] p-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 min-h-[115px] flex flex-col justify-between border border-transparent hover:border-rose-500/10 select-none text-left">
                  <div className="flex justify-between items-start relative z-10 w-full">
                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-455">
                      <Award className="h-4 w-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">GRADO ASIGNADO</span>
                    </div>
                    <div className="w-8 h-8 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-rose-600 dark:text-rose-455 group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="relative z-10 my-2 flex flex-col items-start w-full">
                    <span className="text-[16px] font-extrabold text-[#1B1B1B] dark:text-white leading-tight truncate w-full">
                      {formatAcademicValue(user.grado)}
                    </span>
                  </div>
                  <div className="relative z-10 mt-auto flex items-center justify-between pt-2 border-t border-rose-500/10 w-full">
                    <span className="text-[9.5px] font-bold text-[#1B1B1B]/40 dark:text-slate-400 uppercase tracking-wider">Aula</span>
                    <span className="text-[9.5px] font-black uppercase text-rose-600 dark:text-rose-400 bg-white/70 dark:bg-black/30 px-1.5 py-0.5 rounded-md border border-rose-200/50">
                      DOCENTE
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Security & Password */}
          <Card className="p-5 space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-950/40 text-[#0046ab] dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5 fill-blue-500/20 text-[#0046ab] dark:text-blue-450" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-base text-[#0046ab] dark:text-blue-450">
                  Seguridad de la Cuenta
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold mt-0.5">Actualiza tu contraseña de acceso. Déjalos vacíos si no deseas cambiarla.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B1B] dark:text-neutral-200">Contraseña Actual</label>
                <div className="relative mt-1">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    className="text-xs pr-10 animate-none bg-white dark:bg-zinc-800 dark:border-zinc-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-[#1B1B1B] dark:text-neutral-200">Nueva Contraseña</label>
                  <div className="relative mt-1">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="text-xs pr-10 animate-none bg-white dark:bg-zinc-800 dark:border-zinc-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1B1B1B] dark:text-neutral-200">Confirmar Nueva Contraseña</label>
                  <div className="relative mt-1">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      className="text-xs pr-10 animate-none bg-white dark:bg-zinc-800 dark:border-zinc-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {newPassword && (
                <div className="pt-1">
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="font-semibold text-neutral-400 dark:text-neutral-500">Fuerza de la contraseña:</span>
                    <span className={`font-bold ${passwordStrength.color}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.barColor}`}
                      style={{ width: `${passwordStrength.percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-zinc-800">
              <Button
                onClick={handleSavePassword}
                disabled={isChangingPassword}
                className="bg-[#0046ab] hover:bg-[#0046ab]/90 text-white shadow-none text-xs rounded-lg px-4 py-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Contraseña"
                )}
              </Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-5 space-y-4 bg-red-500/5 dark:bg-zinc-900 border border-red-500/20 dark:border-red-500/30 rounded-[28px] shadow-none">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500/10 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 fill-red-500/20 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-base text-red-600 dark:text-red-400">
                  Zona de Peligro
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-0.5 font-semibold">
                  Eliminar tu cuenta es una acción irreversible que borrará permanentemente todos tus planes didácticos, rúbricas y estudiantes de los servidores de Planix.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <Button onClick={() => setShowDeleteModal(true)} variant="destructive" className="shadow-none gap-1.5 text-xs rounded-xl px-4 py-2.5 font-bold cursor-pointer hover:bg-red-600/90 transition-all">
                <Trash2 className="h-4 w-4" /> Eliminar Cuenta Permanentemente
              </Button>
            </div>
          </Card>
        </div>

        {/* Subscription details */}
        <div className="space-y-4">
          <Card className="p-5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] relative overflow-hidden transition-all duration-300 shadow-none text-left flex flex-col gap-3.5">
            {/* Background gradient decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              <h3 className="font-display font-black text-lg text-[#1B1B1B] dark:text-white">
                Plan de Suscripción
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold mt-0.5">
                {user.suscripcion === "pro"
                  ? "Actualmente estás en el plan Planix Pro"
                  : "Actualmente estás en el plan Gratuito"}
              </p>
            </div>

            {/* Price section - styled similarly to the images */}
            <div className="flex items-center justify-between py-2 border-t border-b border-neutral-100 dark:border-zinc-800/80">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-3.5xl font-black text-[#1B1B1B] dark:text-white tracking-tight">
                  $14.99
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 font-bold">USD</span>
              </div>
              <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black text-white dark:bg-white dark:text-neutral-900 shadow-sm select-none">
                Mensual
              </span>
            </div>

            {/* Features list adapted with /perfil icon circles */}
            <div className="space-y-2.5 pt-0.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 fill-indigo-500/20 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs md:text-[13px] text-neutral-700 dark:text-zinc-300 font-bold">
                  Planificaciones con IA Ilimitadas
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                  <Smile className="h-4 w-4 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs md:text-[13px] text-neutral-700 dark:text-zinc-300 font-bold">
                  Acceso Ilimitado a Dinámicas
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 rounded-full flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 fill-rose-500/20 text-rose-600 dark:text-rose-455" />
                </div>
                <span className="text-xs md:text-[13px] text-neutral-700 dark:text-zinc-300 font-bold">
                  Reportes e informes sin limites
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/10 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center shrink-0">
                  <LayoutGrid className="h-4 w-4 fill-purple-500/20 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs md:text-[13px] text-neutral-700 dark:text-zinc-300 font-bold">
                  Acceso Ilimitado a todas las herramientas
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 fill-amber-500/20 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs md:text-[13px] text-neutral-700 dark:text-zinc-300 font-bold">
                  Creación de aulas virtuales ilimitadas
                </span>
              </div>
            </div>

            {/* Subscription status description (only for Pro plan) */}
            {user.suscripcion === "pro" && (
              <div className="text-[11.5px] text-neutral-500 dark:text-zinc-400 leading-relaxed font-semibold bg-neutral-50/50 dark:bg-zinc-800/40 border border-neutral-100 dark:border-zinc-800/50 p-3.5 rounded-[18px]">
                {(() => {
                  if (!user.suscripcion_hasta) {
                    return (
                      <>
                        Tu suscripción premium ilimitada está activa. Próxima fecha de renovación: <strong className="font-extrabold text-[#1B1B1B] dark:text-white">26 de Junio de 2026.</strong>
                      </>
                    );
                  }

                  const expiryDate = new Date(user.suscripcion_hasta);
                  const now = new Date();
                  const diffTime = expiryDate.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  const formattedDate = expiryDate.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  });

                  if (diffDays <= 0) {
                    return <>Tu suscripción Planix Pro ha expirado.</>;
                  }

                  return (
                    <>
                      Suscripción <strong className="font-extrabold text-[#0046ab] dark:text-blue-400">Planix Pro</strong> activa. Próxima fecha de renovación: <strong className="font-extrabold text-[#1B1B1B] dark:text-white">{formattedDate}</strong>.
                    </>
                  );
                })()}
              </div>
            )}

            {/* Action buttons */}
            {user.suscripcion === "free" ? (
              <Button
                onClick={() => { setModalStep('select'); setShowUpgradeModal(true); }}
                className="w-full bg-[#1B1B1B] hover:bg-[#1B1B1B]/90 dark:bg-white dark:hover:bg-white/90 dark:text-neutral-900 text-white shadow-xs gap-2 text-xs rounded-[18px] py-5 font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 border-none"
              >
                <Crown className="h-4 w-4 fill-white/10 text-white dark:text-neutral-900" /> Actualizar Plan
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="w-full py-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-[18px] text-xs text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center gap-2 select-none">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Suscripción Pro Activa
                </div>

                <button
                  type="button"
                  onClick={handleOpenPolarPortal}
                  disabled={loadingPolarPortal}
                  className="w-full p-3.5 bg-white dark:bg-zinc-800/90 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 rounded-[18px] transition-all duration-200 shadow-3xs hover:shadow-2xs flex items-center justify-between group active:scale-[0.98] select-none cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#0046ab]/10 dark:bg-blue-950/50 text-[#0046ab] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <CreditCard className="w-4 h-4 text-[#0046ab] dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[12px] font-extrabold text-slate-800 dark:text-white leading-tight">Gestionar Facturación</span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-400 leading-tight mt-0.5">Métodos de pago y recibos en Polar.sh</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-700/60 flex items-center justify-center group-hover:bg-[#0046ab] group-hover:text-white transition-all text-slate-400 dark:text-zinc-400 shrink-0">
                    {loadingPolarPortal ? (
                      <div className="w-3 h-3 border-2 border-slate-400 border-t-slate-800 dark:border-zinc-400 dark:border-t-white rounded-full animate-spin" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5 group-hover:text-white" />
                    )}
                  </div>
                </button>
              </div>
            )}
          </Card>

          {/* Linked Account Card */}
          <Card className="p-6 space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] relative overflow-hidden transition-all duration-300 shadow-none">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-950/40 text-[#0046ab] dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 fill-blue-500/20 text-[#0046ab] dark:text-blue-400" />
                </div>
                <h3 className="font-display font-extrabold text-base text-[#0046ab] dark:text-blue-400">
                  Cuenta Vinculada
                </h3>
              </div>
              <span className="text-[8.5px] bg-emerald-500/10 text-emerald-750 dark:text-emerald-400 border border-emerald-500/15 font-black tracking-wider flex items-center gap-0.5 py-0.5 px-2 rounded-full select-none shrink-0">
                <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400 stroke-[4]" />
                VERIFICADA
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 bg-neutral-50/50 dark:bg-zinc-800/40 rounded-2xl border border-neutral-100 dark:border-zinc-800/80">
                <label className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1 block">
                  CORREO ELECTRÓNICO
                </label>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-500/10 dark:bg-blue-950/40 text-[#0046ab] dark:text-blue-450 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 fill-blue-500/20 text-[#0046ab] dark:text-blue-400" />
                  </div>
                  <p className="font-extrabold text-xs text-[#1B1B1B] dark:text-white truncate">{user.email}</p>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-50/50 dark:bg-zinc-800/40 rounded-2xl border border-neutral-100 dark:border-zinc-800/80">
                <label className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1 block">
                  MÉTODO DE ACCESO
                </label>
                <div className="flex items-center gap-2.5">
                  {metodoAcceso === "google" ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-3xs border border-neutral-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.51-2.4 3.08v3.08h3.3c1.93-1.78 3.04-4.4 3.04-7.44z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.3-3.08c-.92.62-2.11 1-3.63 1-3.09 0-5.71-2.08-6.64-4.88H3v3.18C5 21.05 8.23 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.36 14.13c-.24-.72-.38-1.49-.38-2.28 0-.79.14-1.56.38-2.28V6.39H3.18C2.36 8.04 1.9 9.89 1.9 11.85c0 1.96.46 3.81 1.28 5.46l2.18-3.18z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 8.23 0 5 2.95 3.18 6.39l2.18 3.18c.93-2.8 3.55-4.82 6.64-4.82z"
                          />
                        </svg>
                      </div>
                      <span className="font-extrabold text-xs text-[#1B1B1B] dark:text-white">Google Single Sign-On</span>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-blue-500/10 dark:bg-blue-950/40 text-[#0046ab] dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                        <Key className="h-4 w-4 fill-blue-500/20 text-[#0046ab] dark:text-blue-450" />
                      </div>
                      <span className="font-extrabold text-xs text-[#1B1B1B] dark:text-white">Correo y Contraseña</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold leading-relaxed pt-1">
              Tu información de acceso es privada y solo tú puedes verla en este panel de configuración.
            </p>
          </Card>


        </div>
      </div>

      {/* Custom overlay modal for selecting checkout method */}
      {showUpgradeModal && (
        <div
          onClick={() => {
            // Prevent closing by accident if we are in the middle of a transaction
            if (modalStep !== 'waiting_polar') {
              setShowUpgradeModal(false);
            }
          }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer animate-in fade-in duration-200"
        >
          {modalStep === 'select' && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] max-w-[400px] w-full shadow-2xl relative cursor-default overflow-hidden animate-in zoom-in-95 duration-200"
            >
              {/* Primary Blue Header Block */}
              <div className="bg-[#0046ab] p-6 text-white relative overflow-hidden">
                <CreditCard className="absolute -right-4 -bottom-4 h-32 w-32 text-white opacity-[0.08] rotate-12 pointer-events-none" />
                <div className="relative">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md z-30"
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                  </button>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                    PASARELA DE PAGO SEGURA
                  </div>
                  <h2 className="text-2xl font-black leading-tight">Suscripción Pro</h2>
                  <div className="mt-4 flex flex-col items-start">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black">$14 USD</span>
                      <span className="text-xs opacity-80">/mes</span>
                    </div>
                    <span className="text-[11px] opacity-90 mt-1 font-extrabold tracking-wide uppercase">Equivalente a RD$ 800 DOP</span>
                  </div>
                </div>
              </div>

              {/* White Body Block */}
              <div className="p-6 space-y-4">
                {/* CARD BUTTON */}
                <button
                  onClick={() => setModalStep('confirm_card')}
                  className="flex items-center gap-4 w-full p-4 rounded-2xl bg-neutral-50/70 dark:bg-zinc-800/40 hover:bg-[#0046ab] hover:text-white transition-all text-left group relative overflow-hidden shadow-none active:scale-98 cursor-pointer border-none"
                >
                  <div className="w-10 h-10 bg-[#0046ab]/10 dark:bg-[#0046ab]/30 text-[#0046ab] dark:text-blue-400 group-hover:bg-white/20 group-hover:text-white rounded-full flex items-center justify-center shrink-0 transition-all duration-350">
                    <CreditCard className="h-5 w-5 fill-[#0046ab]/20 text-[#0046ab] dark:text-blue-400 group-hover:fill-transparent group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-base text-slate-800 dark:text-white mb-0.5 group-hover:text-white transition-colors">Pago con Tarjeta</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wide group-hover:text-white/80 transition-colors">DÉBITO O CRÉDITO VÍA POLAR.SH</div>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-blue-50 dark:bg-blue-950/20 group-hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0">
                    <ChevronRight className="h-3.5 w-3.5 text-[#0046ab] group-hover:text-white transition-colors" />
                  </div>
                </button>

                {/* TRANSFER BUTTON */}
                <button
                  onClick={handleCheckoutBank}
                  className="flex items-center gap-4 w-full p-4 rounded-2xl bg-neutral-50/70 dark:bg-zinc-800/40 hover:bg-[#0046ab] hover:text-white transition-all text-left group relative overflow-hidden shadow-none active:scale-98 cursor-pointer border-none"
                >
                  <div className="w-10 h-10 bg-[#0046ab]/10 dark:bg-blue-950/30 text-[#0046ab] dark:text-blue-400 group-hover:bg-white/20 group-hover:text-white rounded-full flex items-center justify-center shrink-0 transition-all duration-355">
                    <Landmark className="h-5 w-5 fill-[#0046ab]/20 text-[#0046ab] dark:text-blue-400 group-hover:fill-transparent group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-base text-slate-800 dark:text-white mb-0.5 group-hover:text-white transition-colors">Transferencia</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wide group-hover:text-white/80 transition-colors">PAGO DIRECTO A CUENTA LOCAL</div>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-blue-50 dark:bg-blue-950/20 group-hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0">
                    <ChevronRight className="h-3.5 w-3.5 text-[#0046ab] group-hover:text-white transition-colors" />
                  </div>
                </button>

                {/* Footer Policy */}
                <p className="text-center text-[9px] text-slate-400 dark:text-zinc-500 px-2 pt-2 leading-relaxed">
                  Al suscribirte aceptas nuestros <a href="/terminos" className="underline hover:text-[#0046ab] group-hover:text-white">Términos de Servicio</a> y <a href="/privacidad" className="underline hover:text-[#0046ab] group-hover:text-white">Políticas de Privacidad</a>. Los cargos se realizarán mensualmente de forma automática.
                </p>
              </div>
            </div>
          )}

          {modalStep === 'confirm_card' && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-[420px] w-full shadow-2xl relative cursor-default text-center animate-in zoom-in-95 duration-200"
            >
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-650 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md z-30"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>

              {/* Amber Warning Icon */}
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 dark:border-amber-900/30 shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>

              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Confirmación de Pago</h3>

              {/* Selected Plan Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700/80 rounded-full text-xs font-bold text-slate-500 dark:text-zinc-400 mb-6 select-none">
                <span>PLAN SELECCIONADO:</span>
                <span className="text-[#0046ab] dark:text-blue-400 font-black">Planix Pro</span>
              </div>

              {/* Info alert box */}
              <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/50 dark:border-zinc-850 rounded-2xl p-4 text-left mb-6 relative overflow-hidden">
                <CreditCard className="absolute top-1/2 -right-4 h-24 w-24 text-[#0046ab]/[0.03] dark:text-zinc-700/[0.03] -translate-y-1/2 rotate-12 pointer-events-none" />
                <div className="flex gap-3 relative z-10">
                  <Clock className="w-5 h-5 text-[#0046ab] dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-[#0046ab] dark:text-blue-400">Suscripción Mensual</h4>
                    <p className="text-[11.5px] text-slate-650 dark:text-zinc-350 font-semibold leading-relaxed">
                      Tu suscripción será renovada <strong className="text-[#0046ab] dark:text-blue-400 underline">automáticamente</strong> cada mes realizando el cargo a tu tarjeta.
                    </p>
                    <p className="text-[9.5px] text-slate-400 dark:text-zinc-500 font-medium italic mt-1">
                      * Cancela en cualquier momento desde tu perfil.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3.5 mt-2">
                <button
                  onClick={() => setModalStep('select')}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-650 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm text-center"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleCheckoutPolar}
                  className="flex-1 py-3 bg-[#0046ab] hover:bg-[#0046ab]/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>PAGAR AHORA</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {modalStep === 'bank' && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-[420px] w-full shadow-2xl relative cursor-default text-center animate-in zoom-in-95 duration-200"
            >
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md z-30"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>

              {/* Blue circle Landmark Icon */}
              <div className="w-10 h-10 bg-[#0046ab]/10 dark:bg-blue-950/40 text-[#0046ab] dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 shrink-0">
                <Landmark className="h-5 w-5 fill-[#0046ab]/20 text-[#0046ab] dark:text-blue-400" />
              </div>

              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">Datos Bancarios</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-4 max-w-xs mx-auto">
                Realiza la transferencia y envíanos el comprobante por WhatsApp para activar tu plan de inmediato.
              </p>

              {/* Compacted Bank details card shape */}
              <div className="bg-[#F4F7FC] dark:bg-zinc-850 rounded-[20px] p-4 space-y-3.5 border border-slate-100 dark:border-zinc-800/80 relative overflow-hidden text-left shadow-sm">
                <Landmark className="absolute top-1/2 right-2 h-20 w-20 text-slate-300/10 dark:text-zinc-700/10 -translate-y-1/2 pointer-events-none" />

                <div className="space-y-0.5 relative">
                  <div className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400">INSTITUCIÓN BANCARIA</div>
                  <div className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center justify-between">
                    <span>Banreservas</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText("Banreservas"); toast.success("Nombre de banco copiado"); }}
                      className="h-7 w-7 rounded-lg hover:bg-slate-200/50 dark:hover:bg-zinc-850 flex items-center justify-center text-slate-500 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5 relative">
                  <div className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400">NÚMERO DE CUENTA</div>
                  <div className="font-extrabold text-xl text-[#0046ab] flex items-center justify-between tracking-tight">
                    <span>9603709733</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText("9603709733"); toast.success("Número de cuenta copiado"); }}
                      className="h-7 w-7 rounded-lg hover:bg-slate-200/50 dark:hover:bg-zinc-850 flex items-center justify-center text-slate-500 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative">
                  <div className="space-y-0.5">
                    <div className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400">TIPO</div>
                    <div className="font-extrabold text-slate-800 dark:text-white text-xs">Ahorro</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400">RNC / CÉDULA</div>
                    <div className="font-extrabold text-slate-800 dark:text-white text-xs">402-1275240-2</div>
                  </div>
                </div>

                <div className="space-y-0.5 border-t border-slate-200/50 dark:border-zinc-800 pt-2.5 relative">
                  <div className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400">TITULAR DE LA CUENTA</div>
                  <div className="font-extrabold text-slate-800 dark:text-white text-xs uppercase">YERI ORLANDO DE LA CRUZ NIEVES</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid gap-2.5 mt-6">
                <button
                  onClick={() => {
                    const text = encodeURIComponent(`¡Hola👋!, acabo de realizar la transferencia para la Suscripción de Planix Pro.\n\nUsuario: ${user?.nombre || ''}.\nCorreo: ${user?.email || ''}.\n\nAquí envío el comprobante:`);
                    window.open(`https://wa.me/18299416546?text=${text}`, "_blank");
                  }}
                  className="w-full py-4 bg-[#60D176] hover:bg-[#4fbf64] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.449 5.421 1.45 5.511 0 9.993-4.484 9.996-9.998.002-2.671-1.037-5.182-2.927-7.072C17.247 1.644 14.736.604 12.01.604c-5.517 0-10.002 4.482-10.006 9.995-.001 1.932.501 3.82 1.457 5.432l-.955 3.486 3.57-.936c1.625.887 3.447 1.356 5.281 1.358zm12.385-7.142c-.328-.164-1.94-.959-2.242-1.07-.301-.11-.52-.164-.738.164-.219.329-.848 1.07-1.039 1.29-.19.219-.382.246-.71.082-.328-.164-1.386-.511-2.641-1.63-1.03-.919-1.688-2.054-1.89-2.382-.202-.329-.022-.507.142-.671.148-.147.328-.383.493-.575.164-.19.219-.329.328-.548.11-.219.055-.411-.027-.575-.083-.164-.738-1.78-.999-2.41-.26-.63-.52-.547-.715-.557-.19-.01-.41-.01-.628-.01-.219 0-.575.083-.876.411-.301.329-1.15 1.123-1.15 2.738 0 1.616 1.177 3.177 1.341 3.396.164.219 2.316 3.536 5.61 4.956.783.338 1.395.539 1.872.69.787.25 1.5.215 2.066.13.63-.095 1.94-.794 2.215-1.56.275-.767.275-1.423.192-1.56-.083-.137-.301-.219-.63-.383z" />
                  </svg>
                  <span>ENVIAR COMPROBANTE</span>
                </button>
                <button
                  onClick={() => setModalStep('select')}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver</span>
                </button>
              </div>
            </div>
          )}

          {modalStep === 'waiting_polar' && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-[400px] w-full shadow-2xl relative cursor-default text-center animate-in zoom-in-95 duration-200"
            >
              {/* Sleek Premium Alert Box */}
              <div className="bg-blue-50/40 dark:bg-blue-950/10 border-l-4 border-l-[#0046ab] border-y border-r border-slate-100 dark:border-zinc-800 dark:border-y-zinc-800 dark:border-r-zinc-800 rounded-r-2xl rounded-l-[4px] p-4 text-left mb-6 relative overflow-hidden">
                <div className="flex gap-3 relative z-10">
                  <div className="h-8 w-8 rounded-lg bg-blue-100/80 dark:bg-blue-900/30 flex items-center justify-center text-[#0046ab] dark:text-blue-400 shrink-0">
                    <Info className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Esperando confirmación</h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold leading-relaxed">
                      Una vez completado el pago en Polar, tu plan se activará automáticamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Loading spinner with primary blue styling */}
              <div className="space-y-4 py-6">
                <div className="w-12 h-12 border-4 border-[#0046ab]/30 border-t-[#0046ab] rounded-full animate-spin mx-auto shadow-sm"></div>
                <p className="text-[10px] text-[#0046ab] dark:text-blue-400 font-bold uppercase tracking-widest animate-pulse">
                  Verificando transacción...
                </p>
              </div>

              {/* Actions with primary blue styling and icons */}
              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={verifyPaymentImmediately}
                  className="w-full py-3.5 bg-[#0046ab] hover:bg-[#0046ab]/90 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  <span>Verificar Estado Ahora</span>
                </button>
                <button
                  onClick={() => setModalStep('select')}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span>Volver a opciones</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 shadow-none space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800">
            <div className="flex items-start gap-3 border-b border-neutral-100 dark:border-zinc-800 pb-3">
              <div className="p-2 bg-red-100 dark:bg-red-950/30 text-red-650 rounded-lg shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-red-600">
                  ¿Confirmar eliminación permanente?
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold mt-0.5">
                  Esta acción es irreversible y borrará todos tus datos.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#1B1B1B] dark:text-neutral-300 leading-relaxed font-semibold">
                Para confirmar la eliminación, por favor escribe <strong>ELIMINAR MI CUENTA</strong> a continuación:
              </p>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="ELIMINAR MI CUENTA"
                className="text-xs border-red-200 focus-visible:ring-red-500/25 animate-none bg-white dark:bg-zinc-800"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-neutral-100 dark:border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(""); }} className="border border-neutral-200 dark:border-zinc-700 cursor-pointer">
                Cancelar
              </Button>
              <Button onClick={handleDeleteAccount} disabled={deleting} variant="destructive" size="sm" className="shadow-none cursor-pointer">
                {deleting ? "Eliminando..." : "Eliminar Cuenta"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* DICEBEAR AVATAR EDITOR MODAL */}
      {isEditorOpen && (
        <TeacherAvatarEditor
          seed={user.id}
          value={null}
          onSave={handleSaveAvatar}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}
