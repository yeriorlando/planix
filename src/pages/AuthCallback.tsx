import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { saveUsuario, setSession, Usuario } from "../lib/storage";
import { toast } from "sonner";
import { fetchProfile, mapProfile } from "../lib/services/auth";
import { requestD1 } from "../lib/services/d1Client";
import PlanixLoaderOverlay from "../components/ui/PlanixLoaderOverlay";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const processedRef = React.useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    async function handleCallback() {
      try {
        // Exchange code if PKCE
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        // Get session
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        if (!session) {
          throw new Error("No se pudo iniciar sesión. Por favor, intenta de nuevo.");
        }

        const user = session.user;
        const userId = user.id;

        // Fetch profile from D1
        let userObj = await fetchProfile(userId);

        if (!userObj) {
          const referredByCode = sessionStorage.getItem("plx:referred_by_code") || null;
          const pendingRole = sessionStorage.getItem("plx:pending_role") || "teacher";

          // Create default profile in D1
          const profileData = {
            id: userId,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Docente",
            email: user.email || "",
            role: pendingRole === "coordinator" ? "COORDINADOR" : "DOCENTE",
            subscription_tier: "free",
            subscription_status: "ACTIVO",
            subscription_expiry: new Date(Date.now() + 30 * 86400000).toISOString(),
            school_name: '',
            nivel_principal: 'primaria',
            ciclo_principal: 'ciclo1',
            grado_principal: 'primaria-1ro',
            allowed_subjects: {},
            last_login: new Date().toISOString(),
            is_active: true,
            regional: 'N/A',
            distrito: 'N/A',
            municipio: 'N/A',
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
            referred_by_code: referredByCode,
          };

          try {
            await requestD1<any>("/api/profiles", "POST", profileData);
            if (referredByCode) {
              sessionStorage.removeItem("plx:referred_by_code");
            }
            sessionStorage.removeItem("plx:pending_role");
          } catch (insertError) {
            console.error("Error creating Google profile in D1:", insertError);
            sessionStorage.removeItem("plx:pending_role");
          }

          userObj = mapProfile(profileData);
        }

        // Save session locally
        saveUsuario(userObj);
        setSession({ user_id: userId, iniciado_en: new Date().toISOString() });

        toast.success(`¡Bienvenido, ${userObj.nombre}!`);

        // Check if profile is complete
        setTimeout(() => {
          if (!userObj.colegio) {
            toast.info("Por favor completa tu perfil escolar para comenzar.");
            navigate("/completar-perfil");
          } else {
            navigate(userObj.rol === "coordinator" ? "/coordinador/dashboard" : "/dashboard");
          }
        }, 700);
      } catch (err: any) {
        console.error("OAuth Callback Error:", err);
        setError(err.message || "Error al procesar la sesión.");
        toast.error("Error de autenticación. Regresando al login.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    }

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg-base px-4 font-sans text-text-main">
        <div className="text-center space-y-4 max-w-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-red-500">Error de Autenticación</h2>
            <p className="text-xs text-text-muted">{error}</p>
            <p className="text-xs font-semibold text-text-main">Redirigiendo a Iniciar Sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  return <PlanixLoaderOverlay text="Preparando tu dashboard" />;
}
