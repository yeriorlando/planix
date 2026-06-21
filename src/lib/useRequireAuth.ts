import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, Usuario, seedDemoIfEmpty, logout } from "./storage";
import { fetchProfile } from "./services/auth";
import { syncDownSupabaseToLocalStorage } from "./supabase/sync";

let syncedUserId = "";

export function useRequireAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    // Seed demo data if local storage is completely empty
    seedDemoIfEmpty();
    
    const curr = getCurrentUser();
    if (!curr) {
      navigate("/login");
      return;
    }

    if (curr.estado_suscripcion === "SUSPENDIDO") {
      logout();
      navigate("/login?suspended=true");
      return;
    }
    
    setUser(curr);

    // If we already synced in this session, skip fetching from the database on every page mount
    if (syncedUserId === curr.id) {
      return;
    }

    // Sync profile from D1 in the background
    async function syncProfile() {
      try {
        const profile = await fetchProfile(curr.id);

        if (profile) {
          setUser(profile);

          if (profile.estado_suscripcion === "SUSPENDIDO") {
            logout();
            navigate("/login?suspended=true");
            return;
          }

          // Now sync all other tables down from D1
          try {
            await syncDownSupabaseToLocalStorage(curr.id);
            syncedUserId = curr.id;
            const reloaded = getCurrentUser();
            if (reloaded && reloaded.estado_suscripcion === "SUSPENDIDO") {
              logout();
              navigate("/login?suspended=true");
              return;
            }
            setUser(reloaded);
          } catch (syncErr) {
            console.error("Error syncing down database tables:", syncErr);
          }
        }
      } catch (err) {
        console.warn("Could not sync profile from D1 in background:", err);
      }
    }

    syncProfile();
  }, [navigate]);

  useEffect(() => {
    const handleUserChanged = () => {
      setUser(getCurrentUser());
    };
    if (typeof window !== "undefined") {
      window.addEventListener("plx:user_changed", handleUserChanged);
      // Also listen to standard storage event for cross-tab synchronizations
      window.addEventListener("storage", handleUserChanged);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("plx:user_changed", handleUserChanged);
        window.removeEventListener("storage", handleUserChanged);
      }
    };
  }, []);

  return user;
}
