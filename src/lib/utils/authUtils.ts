import { logout } from "../storage";
import { supabase } from "../supabase";
import { showSuccessToast } from "./toastHelper";

export const PLX_LOGOUT_EVENT = "plx:logout_trigger";

/**
 * Realiza el cierre de sesión con una transición suave y el loader de Planix.
 * Muestra "Cerrando Sesión" durante 1 segundo antes de redirigir a /login.
 */
export async function performLogout(navigate?: (to: string, options?: any) => void) {
  // Notificar al overlay global
  window.dispatchEvent(new CustomEvent(PLX_LOGOUT_EVENT, { detail: { isLoggingOut: true } }));

  try {
    await supabase.auth.signOut().catch(() => {});
  } catch (err) {
    console.warn("Error en signOut de Supabase:", err);
  }

  logout();

  setTimeout(() => {
    window.dispatchEvent(new CustomEvent(PLX_LOGOUT_EVENT, { detail: { isLoggingOut: false } }));
    showSuccessToast("👋 Sesión cerrada. ¡Hasta pronto!");
    if (navigate) {
      navigate("/login");
    } else {
      window.location.href = "/login";
    }
  }, 1000);
}
