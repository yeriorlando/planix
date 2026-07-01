import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://api.planix.do/";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
import { 
  FALLBACK_PROMPT, 
  SOCIALES_PROMPT, 
  NATURALES_PROMPT, 
  ARTISTICA_PROMPT, 
  FISICA_PROMPT, 
  FORMACION_PROMPT 
} from "./prompts/subjectPrompts";

export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== "undefined" && 
   window.location.hostname !== "localhost" && 
   window.location.hostname !== "127.0.0.1"
    ? "https://planix-api.yeriorlando00.workers.dev" 
    : "http://localhost:8787");

// -------------------------------------------------------------
// HELPER FOR SEARCH PARAMS
// -------------------------------------------------------------
function getQueryParams(url: URL): Record<string, string> {
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// -------------------------------------------------------------
// HELPER TO ENSURE RAW JSON OBJECTS ARE PASSED TO POSTGRES
// -------------------------------------------------------------
function ensureJsonObject(val: any): any {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (_) {
      return val;
    }
  }
  return val;
}

// -------------------------------------------------------------
// LOCAL SUPABASE ROUTER DISPATCHER
// -------------------------------------------------------------
async function handleLocalSupabaseRequest(urlString: string, init?: RequestInit): Promise<Response> {
  const base = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const url = new URL(urlString, base);
  const path = url.pathname;
  const method = init?.method || "GET";
  const body = init?.body ? JSON.parse(init.body as string) : undefined;
  const query = getQueryParams(url);
  const parts = path.split("/").filter(Boolean); // e.g. ["api", "profiles", "id"]

  const jsonResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    // ==========================================
    // 1. PROFILES ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/profiles")) {
      const profileId = parts[2]; // /api/profiles/:id

      if (method === "GET") {
        if (profileId) {
          // GET /api/profiles/:id/referrals
          if (parts[3] === "referrals") {
            const { data, error } = await supabase
              .from("profiles")
              .select("id, full_name, email, school_name, nivel_principal, created_at")
              .eq("referred_by", profileId)
              .order("created_at", { ascending: false });

            if (error) throw error;
            return jsonResponse(data || []);
          }

          // GET /api/profiles/:id/stats
          if (parts[3] === "stats") {
            const [classroomsRes, planningsRes, rubricsRes] = await Promise.all([
              supabase.from("classrooms").select("*", { count: "exact", head: true }).eq("teacher_id", profileId),
              supabase.from("plannings").select("*", { count: "exact", head: true }).eq("user_id", profileId),
              supabase.from("rubrics").select("*", { count: "exact", head: true }).eq("teacher_id", profileId),
            ]);

            const { data: classrooms } = await supabase
              .from("classrooms")
              .select("id")
              .eq("teacher_id", profileId);

            const classroomIds = (classrooms || []).map((c) => c.id);

            let studentsCount = 0;
            let attendanceCount = 0;
            let gradesCount = 0;

            if (classroomIds.length > 0) {
              const [studentsRes, attendanceRes, gradesRes] = await Promise.all([
                supabase.from("students").select("*", { count: "exact", head: true }).in("classroom_id", classroomIds),
                supabase.from("attendance").select("*", { count: "exact", head: true }).in("classroom_id", classroomIds),
                supabase.from("official_grades").select("*", { count: "exact", head: true }).in("classroom_id", classroomIds),
              ]);
              studentsCount = studentsRes.count || 0;
              attendanceCount = attendanceRes.count || 0;
              gradesCount = gradesRes.count || 0;
            }

            return jsonResponse({
              classrooms: classroomsRes.count || 0,
              plannings: planningsRes.count || 0,
              rubrics: rubricsRes.count || 0,
              students: studentsCount,
              attendance: attendanceCount,
              grades: gradesCount,
            });
          }

          // GET /api/profiles/:id
          const { data: row, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", profileId)
            .single();

          if (error || !row) {
            return jsonResponse({ error: "Profile not found" }, 404);
          }

          // Generate referral_code if missing
          if (!row.referral_code) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let code = "";
            for (let i = 0; i < 6; i++) {
              code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            row.referral_code = code;
            try {
              await supabase
                .from("profiles")
                .update({ 
                  referral_code: code,
                  updated_at: new Date().toISOString()
                })
                .eq("id", profileId);
            } catch (err) {
              console.error("Error self-healing/generating referral code:", err);
            }
          }

          // Parse JSON fields
          if (row.allowed_subjects && typeof row.allowed_subjects === "string") {
            try {
              row.allowed_subjects = JSON.parse(row.allowed_subjects);
            } catch (_) {}
          }
          if (row.preferences && typeof row.preferences === "string") {
            try {
              row.preferences = JSON.parse(row.preferences);
            } catch (_) {}
          }

          return jsonResponse(row);
        } else {
          // Fetch all profiles
          const { data: results, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;

          results?.forEach((row: any) => {
            if (row.allowed_subjects && typeof row.allowed_subjects === "string") {
              try {
                row.allowed_subjects = JSON.parse(row.allowed_subjects);
              } catch (_) {
                row.allowed_subjects = {};
              }
            }
            if (row.preferences && typeof row.preferences === "string") {
              try {
                row.preferences = JSON.parse(row.preferences);
              } catch (_) {
                row.preferences = {};
              }
            }
          });

          return jsonResponse(results || []);
        }
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing profile ID or body" }, 400);
        }

        let oldProfile: any = null;
        try {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", body.id)
            .single();
          if (data) oldProfile = data;
        } catch (_) {}

        // Generate referral_code if missing
        let referralCode = oldProfile?.referral_code;
        if (!referralCode) {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          let code = "";
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          referralCode = code;
        }

        let referredBy = oldProfile?.referred_by || null;
        let extraCredits = 0;

        // Process referral code
        if (!oldProfile && body.referred_by_code) {
          try {
            const { data: referrer } = await supabase
              .from("profiles")
              .select("id, credits")
              .eq("referral_code", body.referred_by_code)
              .single();

            if (referrer && referrer.id !== body.id) {
              referredBy = referrer.id;
              let referrerReward = 50;
              let referredReward = 30;

              const { data: configRow } = await supabase
                .from("site_configs")
                .select("value")
                .eq("key", "referral_settings")
                .single();

              if (configRow && configRow.value) {
                try {
                  const settings = typeof configRow.value === "string"
                    ? JSON.parse(configRow.value)
                    : configRow.value;
                  if (settings.referrer_credits !== undefined) {
                    referrerReward = Number(settings.referrer_credits);
                  }
                  if (settings.referred_credits !== undefined) {
                    referredReward = Number(settings.referred_credits);
                  }
                } catch (e) {
                  console.error("Error parsing referral settings:", e);
                }
              }

              // Award credits to referrer
              const currentReferrerCredits = referrer.credits !== undefined ? Number(referrer.credits) : 100;
              await supabase
                .from("profiles")
                .update({ 
                  credits: currentReferrerCredits + referrerReward,
                  updated_at: new Date().toISOString()
                })
                .eq("id", referrer.id);

              extraCredits = referredReward;
            }
          } catch (refError) {
            console.error("Error processing referral code:", refError);
          }
        }

        let finalCredits = body.credits !== undefined ? body.credits : (body.creditos !== undefined ? body.creditos : null);
        if (finalCredits === null) {
          finalCredits = oldProfile?.credits !== undefined ? oldProfile.credits : 100;
        }
        if (!oldProfile && finalCredits !== null) {
          finalCredits = Number(finalCredits) + extraCredits;
        }

        let regionalVal = body.regional !== undefined ? body.regional : (oldProfile?.regional || null);
        let distritoVal = body.distrito !== undefined ? body.distrito : (oldProfile?.distrito || null);
        let municipioVal = body.municipio !== undefined ? body.municipio : (oldProfile?.municipio || null);
        const schoolNameVal = body.school_name !== undefined ? body.school_name : (body.colegio !== undefined ? body.colegio : (oldProfile?.school_name || null));

        const isMissingRegional = !regionalVal || (typeof regionalVal === 'string' && (regionalVal === 'N/A' || regionalVal === 'NA' || regionalVal.trim() === ''));
        const isMissingDistrito = !distritoVal || (typeof distritoVal === 'string' && (distritoVal === 'N/A' || distritoVal === 'NA' || distritoVal.trim() === ''));
        const isMissingMunicipio = !municipioVal || (typeof municipioVal === 'string' && (municipioVal === 'N/A' || municipioVal === 'NA' || municipioVal.trim() === ''));

        if (schoolNameVal && (isMissingRegional || isMissingDistrito || isMissingMunicipio)) {
          try {
            const { data: matchedSchool } = await supabase
              .from("schools")
              .select("regional, district, municipality")
              .ilike("name", schoolNameVal.trim())
              .limit(1)
              .maybeSingle();

            if (matchedSchool) {
              if (isMissingRegional) regionalVal = matchedSchool.regional || 'N/A';
              if (isMissingDistrito) distritoVal = matchedSchool.district || 'N/A';
              if (isMissingMunicipio) municipioVal = matchedSchool.municipality || 'N/A';
            }
          } catch (schoolErr) {
            console.error("Error looking up school metadata in local profiles router:", schoolErr);
          }
        }

        const profileData = {
          id: body.id,
          full_name: body.full_name !== undefined ? body.full_name : (body.nombre !== undefined ? body.nombre : (oldProfile?.full_name || "")),
          email: body.email !== undefined ? body.email : (oldProfile?.email || ""),
          role: body.role !== undefined ? body.role : (body.rol !== undefined ? body.rol : (oldProfile?.role || "teacher")),
          subscription_tier: body.subscription_tier !== undefined ? body.subscription_tier : (body.suscripcion !== undefined ? body.suscripcion : (oldProfile?.subscription_tier || "free")),
          subscription_status: body.subscription_status !== undefined ? body.subscription_status : (body.estado_suscripcion !== undefined ? body.estado_suscripcion : (oldProfile?.subscription_status || "ACTIVO")),
          subscription_expiry: body.subscription_expiry !== undefined ? body.subscription_expiry : (body.suscripcion_hasta !== undefined ? body.suscripcion_hasta : (oldProfile?.subscription_expiry || null)),
          school_name: schoolNameVal,
          nivel_principal: body.nivel_principal !== undefined ? body.nivel_principal : (body.nivel !== undefined ? body.nivel : (oldProfile?.nivel_principal || null)),
          ciclo_principal: body.ciclo_principal !== undefined ? body.ciclo_principal : (body.ciclo !== undefined ? body.ciclo : (oldProfile?.ciclo_principal || null)),
          grado_principal: body.grado_principal !== undefined ? body.grado_principal : (body.grado !== undefined ? body.grado : (oldProfile?.grado_principal || null)),
          allowed_subjects: body.allowed_subjects !== undefined ? body.allowed_subjects : (oldProfile?.allowed_subjects || null),
          last_login: body.last_login !== undefined ? body.last_login : (oldProfile?.last_login || new Date().toISOString()),
          is_active: body.is_active !== undefined ? (body.is_active ? true : false) : (oldProfile?.is_active !== undefined ? oldProfile.is_active : true),
          regional: regionalVal,
          distrito: distritoVal,
          municipio: municipioVal,
          avatar_url: body.avatar_url !== undefined ? body.avatar_url : (oldProfile?.avatar_url || null),
          credits: finalCredits,
          referral_code: referralCode,
          referred_by: referredBy,
          updated_at: new Date().toISOString(),

          // Preserving other database columns to avoid overwriting them to null during upsert
          year_escolar_activo: body.year_escolar_activo !== undefined ? body.year_escolar_activo : (oldProfile?.year_escolar_activo || null),
          preferences: body.preferences !== undefined ? (() => {
              if (typeof body.preferences === "string") {
                try { return JSON.parse(body.preferences); } catch (_) { return body.preferences; }
              }
              return body.preferences;
            })() : (oldProfile?.preferences || null),
          phone: body.phone !== undefined ? body.phone : (oldProfile?.phone || null),
          provincia: body.provincia !== undefined ? body.provincia : (oldProfile?.provincia || null),
          codigo_centro: body.codigo_centro !== undefined ? body.codigo_centro : (oldProfile?.codigo_centro || null),
          community_bio: body.community_bio !== undefined ? body.community_bio : (oldProfile?.community_bio || null),
          polar_customer_id: body.polar_customer_id !== undefined ? body.polar_customer_id : (oldProfile?.polar_customer_id || null),
          is_ambassador: body.is_ambassador !== undefined ? (body.is_ambassador ? true : false) : (oldProfile?.is_ambassador !== undefined ? oldProfile.is_ambassador : false),
          current_plan_id: body.current_plan_id !== undefined ? body.current_plan_id : (oldProfile?.current_plan_id || null),
          asignaturas: body.asignaturas !== undefined ? body.asignaturas : (oldProfile?.asignaturas || null),
          jornada: body.jornada !== undefined ? body.jornada : (oldProfile?.jornada || null),
          fingerprint: body.fingerprint !== undefined ? body.fingerprint : (oldProfile?.fingerprint || null)
        };

        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert(profileData);

        if (upsertError) throw upsertError;
        return jsonResponse({ success: true });
      }

      // Update password
      if (method === "PUT" && profileId && parts[3] === "password") {
        if (!body || !body.password_hash) {
          return jsonResponse({ error: "Missing password_hash" }, 400);
        }
        const { error } = await supabase
          .from("profiles")
          .update({ 
            password_hash: body.password_hash,
            updated_at: new Date().toISOString()
          })
          .eq("id", profileId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      // Delete profile cascade
      if (method === "DELETE" && profileId) {
        const { data: classrooms } = await supabase
          .from("classrooms")
          .select("id")
          .eq("teacher_id", profileId);

        const classroomIds = (classrooms || []).map((c) => c.id);

        if (classroomIds.length > 0) {
          await Promise.all([
            supabase.from("students").delete().in("classroom_id", classroomIds),
            supabase.from("attendance").delete().in("classroom_id", classroomIds),
            supabase.from("anecdotal_records").delete().in("classroom_id", classroomIds),
            supabase.from("school_incidents").delete().in("classroom_id", classroomIds),
            supabase.from("official_grades").delete().in("classroom_id", classroomIds),
            supabase.from("subject_summaries").delete().in("classroom_id", classroomIds),
          ]);
        }

        await Promise.all([
          supabase.from("classrooms").delete().eq("teacher_id", profileId),
          supabase.from("plannings").delete().eq("user_id", profileId),
          supabase.from("rubrics").delete().eq("teacher_id", profileId),
          supabase.from("community_posts").delete().eq("docente_id", profileId),
          supabase.from("profiles").delete().eq("id", profileId)
        ]);

        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 2. SCHOOLS ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/schools")) {
      if (method === "GET") {
        const search = query.search;
        if (!search || search.trim().length < 2) {
          return jsonResponse([]);
        }

        const { data: results, error } = await supabase
          .from("schools")
          .select("id, name, regional, district, municipality")
          .or(`name.ilike.%${search}%,municipality.ilike.%${search}%,regional.ilike.%${search}%`)
          .order("name", { ascending: true })
          .limit(50);

        if (error) throw error;

        const unique = [];
        const seen = new Set();
        for (const r of (results || [])) {
          const key = `${r.name}_${r.regional}_${r.district}_${r.municipality}`.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(r);
          }
        }
        return jsonResponse(unique);
      }
    }

    // ==========================================
    // 3. CLASSROOMS ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/classrooms")) {
      const classroomId = parts[2];

      if (method === "GET") {
        const teacherId = query.teacher_id;
        let q = supabase.from("classrooms").select("*");
        if (teacherId) {
          q = q.eq("teacher_id", teacherId);
        }
        const { data, error } = await q.order("name", { ascending: true });
        if (error) throw error;
        return jsonResponse(data || []);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing classroom ID" }, 400);
        }

        const classroomRow = {
          id: body.id,
          teacher_id: body.teacher_id || body.docente_id,
          name: body.name || body.nombre,
          grade: body.grade || body.grado,
          section: body.section || body.seccion || "",
          academic_year: body.academic_year || body.periodo,
          created_at: body.created_at || body.creado_en || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("classrooms")
          .upsert(classroomRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && classroomId) {
        const { error } = await supabase
          .from("classrooms")
          .delete()
          .eq("id", classroomId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 4. STUDENTS ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/students")) {
      const studentId = parts[2];

      if (method === "GET") {
        if (studentId) {
          const { data, error } = await supabase
            .from("students")
            .select("*")
            .eq("id", studentId)
            .single();

          if (error) return jsonResponse(null);
          return jsonResponse(data);
        }

        const classroomId = query.classroom_id;
        if (!classroomId) {
          return jsonResponse({ error: "classroom_id parameter is required" }, 400);
        }

        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("classroom_id", classroomId)
          .order("order_number", { ascending: true });

        if (error) throw error;
        return jsonResponse(data || []);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing student ID" }, 400);
        }

        const studentRow = {
          id: body.id,
          classroom_id: body.classroom_id,
          first_name: body.first_name || body.nombre,
          last_name: body.last_name || body.apellido || "",
          student_id_number: body.student_id_number || body.rne_matricula || "",
          order_number: body.order_number || body.numero_orden,
          gender: body.gender || body.genero,
          address: body.address || body.direccion || "",
          avatar_url: body.avatar_url || "",
          created_at: body.created_at || body.creado_en || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("students")
          .upsert(studentRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && studentId) {
        const { error } = await supabase
          .from("students")
          .delete()
          .eq("id", studentId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 5. ATTENDANCE ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/attendance")) {
      if (method === "GET") {
        const classroomId = query.classroom_id;
        if (!classroomId) {
          return jsonResponse({ error: "classroom_id parameter is required" }, 400);
        }

        const { data, error } = await supabase
          .from("attendance")
          .select("*")
          .eq("classroom_id", classroomId);

        if (error) throw error;
        return jsonResponse(data || []);
      }

      if (method === "POST") {
        if (!body || !Array.isArray(body)) {
          return jsonResponse({ error: "Expected an array of attendance records" }, 400);
        }

        const attendanceRows = body.map((record) => ({
          student_id: record.student_id,
          classroom_id: record.classroom_id,
          date: record.date,
          status: record.status,
          notes: record.notes || "regular",
          created_at: record.created_at || new Date().toISOString()
        }));

        const { error } = await supabase
          .from("attendance")
          .upsert(attendanceRows, { onConflict: "student_id,date" });

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE") {
        const classroomId = query.classroom_id;
        const date = query.date;
        if (!classroomId || !date) {
          return jsonResponse({ error: "classroom_id and date parameters are required" }, 400);
        }

        const { error } = await supabase
          .from("attendance")
          .delete()
          .eq("classroom_id", classroomId)
          .eq("date", date);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 6. PLANNINGS ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/plannings")) {
      const planningId = parts[2];

      if (method === "GET") {
        const userId = query.user_id;
        const planId = query.id;
        let q = supabase.from("plannings").select("*");
        if (planId) {
          q = q.eq("id", planId);
        } else if (userId) {
          q = q.eq("user_id", userId);
        }
        const { data, error } = await q.order("created_at", { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map((row: any) => {
          if (row.content && typeof row.content === "string") {
            try {
              row.content = JSON.parse(row.content);
            } catch (_) {}
          }
          return row;
        });

        return jsonResponse(mapped);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing planning ID or body" }, 400);
        }

        const planningRow = {
          id: body.id,
          user_id: body.user_id,
          title: body.title || "",
          type: body.type || "CURRICULAR",
          subject_id: body.subject_id || null,
          grade_id: body.grade_id || null,
          status: body.status || "Borrador",
          content: ensureJsonObject(body.content || {}),
          is_public: body.is_public ? true : false,
          created_at: body.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("plannings")
          .upsert(planningRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && planningId) {
        const { error } = await supabase
          .from("plannings")
          .delete()
          .eq("id", planningId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 7. RUBRICS & METADATA ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/rubrics")) {
      const rubricId = parts[2];

      if (method === "GET") {
        if (rubricId) {
          const { data: row, error } = await supabase
            .from("rubrics")
            .select("*")
            .eq("id", rubricId)
            .single();

          if (error || !row) {
            return jsonResponse({ error: "Rubric not found" }, 404);
          }
          if (row.criteria && typeof row.criteria === "string") {
            try {
              row.criteria = JSON.parse(row.criteria);
            } catch (_) {}
          }
          return jsonResponse(row);
        }

        const teacherId = query.teacher_id;
        if (!teacherId) {
          return jsonResponse({ error: "teacher_id parameter is required" }, 400);
        }

        const { data, error } = await supabase
          .from("rubrics")
          .select("*")
          .eq("teacher_id", teacherId);

        if (error) throw error;

        const mapped = (data || []).map((row: any) => {
          if (row.criteria && typeof row.criteria === "string") {
            try {
              row.criteria = JSON.parse(row.criteria);
            } catch (_) {}
          }
          return row;
        });

        return jsonResponse(mapped);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing rubric ID or body" }, 400);
        }

        const rubricRow = {
          id: body.id,
          teacher_id: body.teacher_id,
          title: body.title || "",
          description: body.description || "",
          subject_id: body.subject_id || "GENERAL",
          criteria: ensureJsonObject(body.criteria || []),
          type: body.type || "RUBRIC",
          created_at: body.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("rubrics")
          .upsert(rubricRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && rubricId) {
        const { error } = await supabase
          .from("rubrics")
          .delete()
          .eq("id", rubricId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    if (path.startsWith("/api/rubric-metadata")) {
      if (method === "GET") {
        const rId = query.rubric_id;
        const cId = query.classroom_id;
        if (!rId || !cId) {
          return jsonResponse({ error: "rubric_id and classroom_id are required" }, 400);
        }

        const { data: row, error } = await supabase
          .from("rubric_classroom_metadata")
          .select("*")
          .eq("rubric_id", rId)
          .eq("classroom_id", cId)
          .single();

        if (error || !row) {
          return jsonResponse(null);
        }

        if (row.indicators && typeof row.indicators === "string") {
          try {
            row.indicators = JSON.parse(row.indicators);
          } catch (_) {}
        }
        if (row.competencies && typeof row.competencies === "string") {
          try {
            row.competencies = JSON.parse(row.competencies);
          } catch (_) {}
        }

        return jsonResponse(row);
      }

      if (method === "POST") {
        if (!body || !body.rubric_id || !body.classroom_id) {
          return jsonResponse({ error: "Missing rubric_id or classroom_id" }, 400);
        }

        const metadataRow = {
          rubric_id: body.rubric_id,
          classroom_id: body.classroom_id,
          indicators: ensureJsonObject(body.indicators || []),
          competencies: ensureJsonObject(body.competencies || []),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("rubric_classroom_metadata")
          .upsert(metadataRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 8. STUDENT EVALUATIONS ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/student-evaluations")) {
      const evalId = parts[2];

      if (method === "GET") {
        const rubricId = query.rubric_id;
        const studentId = query.student_id;
        
        let results;
        if (rubricId) {
          const { data, error } = await supabase
            .from("student_evaluations")
            .select("*")
            .eq("rubric_id", rubricId);
          if (error) throw error;
          results = data;
        } else if (studentId) {
          const { data, error } = await supabase
            .from("student_evaluations")
            .select("*")
            .eq("student_id", studentId);
          if (error) throw error;
          results = data;
        } else {
          return jsonResponse({ error: "rubric_id or student_id parameter is required" }, 400);
        }

        return jsonResponse(results || []);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing evaluation ID or body" }, 400);
        }

        const evalRow = {
          id: body.id,
          student_id: body.student_id,
          rubric_id: body.rubric_id,
          subject_id: body.subject_id || "GENERAL",
          evaluation_type: body.evaluation_type || "RUBRIC",
          score: body.score || 0,
          competency_level: body.competency_level || null,
          feedback: body.feedback || "",
          date: body.date || new Date().toISOString().split("T")[0],
          created_at: body.created_at || new Date().toISOString()
        };

        const { error } = await supabase
          .from("student_evaluations")
          .upsert(evalRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && evalId) {
        const { error } = await supabase
          .from("student_evaluations")
          .delete()
          .eq("id", evalId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 9. ANECDOTAL RECORDS & INCIDENTS
    // ==========================================
    if (path.startsWith("/api/anecdotal-records")) {
      const recordId = parts[2];

      if (method === "GET") {
        const classroomId = query.classroom_id;
        const studentId = query.student_id;
        
        let results;
        if (classroomId) {
          const { data, error } = await supabase
            .from("anecdotal_records")
            .select("*")
            .eq("classroom_id", classroomId);
          if (error) throw error;
          results = data;
        } else if (studentId) {
          const { data, error } = await supabase
            .from("anecdotal_records")
            .select("*")
            .eq("student_id", studentId);
          if (error) throw error;
          results = data;
        } else {
          return jsonResponse({ error: "classroom_id or student_id required" }, 400);
        }
        return jsonResponse(results || []);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing record ID" }, 400);
        }

        const anecdotalRow = {
          id: body.id,
          student_id: body.student_id,
          teacher_id: body.teacher_id,
          classroom_id: body.classroom_id,
          date: body.date,
          description: body.description,
          strategy: body.strategy || null,
          comment: body.comment || "guardado",
          period: body.period || "P1",
          area: body.area || "Académica",
          is_weakness: body.is_weakness ? true : false,
          created_at: body.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("anecdotal_records")
          .upsert(anecdotalRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && recordId) {
        const { error } = await supabase
          .from("anecdotal_records")
          .delete()
          .eq("id", recordId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    if (path.startsWith("/api/school-incidents")) {
      const incidentId = parts[2];

      if (method === "GET") {
        const studentId = query.student_id;
        if (!studentId) {
          return jsonResponse({ error: "student_id required" }, 400);
        }
        const { data, error } = await supabase
          .from("school_incidents")
          .select("*")
          .eq("student_id", studentId);

        if (error) throw error;
        return jsonResponse(data || []);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing incident ID" }, 400);
        }

        const incidentRow = {
          id: body.id,
          student_id: body.student_id,
          teacher_id: body.teacher_id || "",
          classroom_id: body.classroom_id || null,
          incident_date: body.incident_date,
          incident_type: body.incident_type || "leve",
          description: body.description,
          actions_taken: body.actions_taken || null,
          observations: body.observations || null,
          created_at: body.created_at || new Date().toISOString()
        };

        const { error } = await supabase
          .from("school_incidents")
          .upsert(incidentRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && incidentId) {
        const { error } = await supabase
          .from("school_incidents")
          .delete()
          .eq("id", incidentId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 10. OFFICIAL GRADES & SUMMARIES
    // ==========================================
    if (path.startsWith("/api/official-grades")) {
      if (method === "GET") {
        const classroomId = query.classroom_id;
        const subjectId = query.subject_id;
        if (!classroomId) {
          return jsonResponse({ error: "classroom_id is required" }, 400);
        }

        let queryBuilder = supabase.from("official_grades").select("*").eq("classroom_id", classroomId);
        if (subjectId) {
          queryBuilder = queryBuilder.eq("subject_id", subjectId);
        }
        const { data, error } = await queryBuilder;

        if (error) throw error;
        return jsonResponse(data || []);
      }

      if (method === "POST") {
        if (!body || !Array.isArray(body)) {
          return jsonResponse({ error: "Expected array of grade records" }, 400);
        }

        const gradeRows = body.map((r) => ({
          student_id: r.student_id,
          classroom_id: r.classroom_id,
          subject_id: r.subject_id,
          competency_id: r.competency_id,
          p1: r.p1 !== undefined ? r.p1 : null,
          rp1: r.rp1 !== undefined ? r.rp1 : null,
          p2: r.p2 !== undefined ? r.p2 : null,
          rp2: r.rp2 !== undefined ? r.rp2 : null,
          p3: r.p3 !== undefined ? r.p3 : null,
          rp3: r.rp3 !== undefined ? r.rp3 : null,
          p4: r.p4 !== undefined ? r.p4 : null,
          rp4: r.rp4 !== undefined ? r.rp4 : null,
          competency_average: r.competency_average !== undefined ? r.competency_average : null,
          academic_year: r.academic_year,
          created_at: r.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from("official_grades")
          .upsert(gradeRows, { onConflict: "student_id,subject_id,competency_id,academic_year" });

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    if (path.startsWith("/api/subject-summaries")) {
      if (method === "POST") {
        if (!body || !Array.isArray(body)) {
          return jsonResponse({ error: "Expected array of summaries" }, 400);
        }

        const summaryRows = body.map((s) => ({
          student_id: s.student_id,
          classroom_id: s.classroom_id,
          subject_id: s.subject_id,
          final_area_grade: s.final_area_grade !== undefined ? s.final_area_grade : null,
          status: s.status || null,
          academic_year: s.academic_year,
          created_at: s.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from("subject_summaries")
          .upsert(summaryRows, { onConflict: "student_id,subject_id,academic_year" });

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 11. SITE CONFIGS ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/site-configs")) {
      const configKey = parts[2]; // /api/site-configs/:key

      if (method === "GET" && configKey) {
        const { data: row, error } = await supabase
          .from("site_configs")
          .select("*")
          .eq("key", configKey)
          .single();

        if (error || !row) {
          // Self-healing / fallbacks
          if (configKey === "subject_prompts") {
            const defaultPrompts = {
              "Lengua Española": FALLBACK_PROMPT,
              "Matemática": FALLBACK_PROMPT,
              "Ciencias Sociales": SOCIALES_PROMPT,
              "Ciencias de la Naturaleza": NATURALES_PROMPT,
              "Educación Artística": ARTISTICA_PROMPT,
              "Educación Física": FISICA_PROMPT,
              "Formación Integral Humana y Religiosa": FORMACION_PROMPT
            };
            await supabase
              .from("site_configs")
              .upsert({ key: "subject_prompts", value: defaultPrompts, updated_at: new Date().toISOString() });

            return jsonResponse({
              key: "subject_prompts",
              value: defaultPrompts,
              updated_at: new Date().toISOString()
            });
          } else if (configKey === "active_school_year") {
            const defaultYear = "2025-2026";
            await supabase
              .from("site_configs")
              .upsert({ key: "active_school_year", value: defaultYear, updated_at: new Date().toISOString() });

            return jsonResponse({
              key: "active_school_year",
              value: defaultYear,
              updated_at: new Date().toISOString()
            });
          } else if (configKey === "referral_settings") {
            const defaultSettings = { referrer_credits: 50, referred_credits: 30 };
            await supabase
              .from("site_configs")
              .upsert({ key: "referral_settings", value: defaultSettings, updated_at: new Date().toISOString() });

            return jsonResponse({
              key: "referral_settings",
              value: defaultSettings,
              updated_at: new Date().toISOString()
            });
          } else {
            return jsonResponse({ error: "Config not found" }, 404);
          }
        }

        if (row && row.value && typeof row.value === "string") {
          try {
            row.value = JSON.parse(row.value);
          } catch (_) {}
        }
        return jsonResponse(row);
      }

      if (method === "POST") {
        if (!body || !body.key) {
          return jsonResponse({ error: "Missing config key or body" }, 400);
        }

        const configRow = {
          key: body.key,
          value: ensureJsonObject(body.value),
          updated_at: body.updated_at || new Date().toISOString()
        };

        const { error } = await supabase
          .from("site_configs")
          .upsert(configRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 12. COMMUNITY POSTS ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/community-posts")) {
      const postId = parts[2]; // /api/community-posts/:id

      if (method === "GET") {
        if (postId) {
          const { data: row, error } = await supabase
            .from("community_posts")
            .select("*")
            .eq("id", postId)
            .single();

          if (error || !row) {
            return jsonResponse({ error: "Post not found" }, 404);
          }
          
          if (row.liked_by && typeof row.liked_by === "string") {
            try { row.liked_by = JSON.parse(row.liked_by); } catch (_) { row.liked_by = []; }
          }
          if (row.bookmarked_by && typeof row.bookmarked_by === "string") {
            try { row.bookmarked_by = JSON.parse(row.bookmarked_by); } catch (_) { row.bookmarked_by = []; }
          }
          if (row.comentarios && typeof row.comentarios === "string") {
            try { row.comentarios = JSON.parse(row.comentarios); } catch (_) { row.comentarios = []; }
          }

          return jsonResponse(row);
        } else {
          const { data: results, error } = await supabase
            .from("community_posts")
            .select("*")
            .order("creado_en", { ascending: false });

          if (error) throw error;

          results?.forEach((row: any) => {
            if (row.liked_by && typeof row.liked_by === "string") {
              try { row.liked_by = JSON.parse(row.liked_by); } catch (_) { row.liked_by = []; }
            }
            if (row.bookmarked_by && typeof row.bookmarked_by === "string") {
              try { row.bookmarked_by = JSON.parse(row.bookmarked_by); } catch (_) { row.bookmarked_by = []; }
            }
            if (row.comentarios && typeof row.comentarios === "string") {
              try { row.comentarios = JSON.parse(row.comentarios); } catch (_) { row.comentarios = []; }
            }
          });

          return jsonResponse(results || []);
        }
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing post ID or body" }, 400);
        }

        if (postId && parts[3] === "view") {
          const { error: rpcError } = await supabase.rpc("record_post_view", { post_id: postId });
          if (rpcError) {
            try {
              const { data: post } = await supabase.from("community_posts").select("views_count").eq("id", postId).single();
              const currentViews = post?.views_count || 0;
              await supabase.from("community_posts").update({ views_count: currentViews + 1 }).eq("id", postId);
            } catch (_) {}
          }
          return jsonResponse({ success: true });
        }

        const postRow = {
          id: body.id,
          docente_id: body.docente_id || "",
          docente_nombre: body.docente_nombre || "",
          docente_rol: body.docente_rol || "",
          contenido: body.contenido || "",
          likes_count: body.likes_count || 0,
          comments_count: body.comments_count || 0,
          bookmarks_count: body.bookmarks_count || 0,
          views_count: body.views_count || 0,
          liked_by: ensureJsonObject(body.liked_by || []),
          bookmarked_by: ensureJsonObject(body.bookmarked_by || []),
          creado_en: body.creado_en || new Date().toISOString(),
          comentarios: ensureJsonObject(body.comentarios || []),
          comments_disabled: body.comments_disabled ? true : false
        };

        const { error } = await supabase
          .from("community_posts")
          .upsert(postRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && postId) {
        const { error } = await supabase
          .from("community_posts")
          .delete()
          .eq("id", postId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 13. CUSTOM SEQUENCES ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/custom-sequences")) {
      const sequenceId = parts[2];

      if (method === "GET") {
        if (sequenceId) {
          const { data: seq, error: seqErr } = await supabase
            .from("sequences")
            .select("*")
            .eq("id", sequenceId)
            .single();

          if (seqErr || !seq) {
            return jsonResponse({ error: "Sequence not found" }, 404);
          }

          const { data: acts } = await supabase
            .from("sequence_activities")
            .select("*")
            .eq("sequence_id", seq.id)
            .order("order_index", { ascending: true });

          const formattedActivities = (acts || []).map(a => ({
            id: a.id,
            title: a.title,
            name: a.name,
            pedagogicalIntention: a.intencion_pedagogica,
            moments: Array.isArray(a.inicio) ? a.inicio : [],
            homework: a.actividades_cuaderno || "",
            resources: ""
          }));

          let content: any = {};
          if (seq.blocks) {
            let parsedBlocks = [];
            try {
              parsedBlocks = typeof seq.blocks === "string" ? JSON.parse(seq.blocks) : seq.blocks;
            } catch (_) {}
            content = {
              id: seq.id,
              subjectId: seq.subjectId,
              sequenceId: seq.sequenceId,
              sequenceTitle: seq.sequenceTitle,
              duration_weeks: seq.duration_weeks,
              blocks: parsedBlocks
            };
          } else {
            content = {
              id: seq.id,
              subject_id: seq.subjectId || seq.subject_id,
              grade_id: seq.grade_id,
              title: seq.sequenceTitle,
              duration_weeks: seq.duration_weeks,
              activities: formattedActivities
            };
          }

          return jsonResponse({
            id: seq.id,
            subject_id: seq.subjectId,
            grade_id: seq.grade_id || "",
            content: content,
            updated_at: seq.updated_at || new Date().toISOString()
          });
        } else {
          const { data: seqs, error: seqsErr } = await supabase
            .from("sequences")
            .select("*");

          if (seqsErr) throw seqsErr;

          const { data: acts } = await supabase
            .from("sequence_activities")
            .select("*")
            .order("order_index", { ascending: true });

          const stitched = (seqs || []).map((seq: any) => {
            const seqActs = (acts || []).filter(a => a.sequence_id === seq.id);
            const formattedActivities = seqActs.map(a => ({
              id: a.id,
              title: a.title,
              name: a.name,
              pedagogicalIntention: a.intencion_pedagogica,
              moments: Array.isArray(a.inicio) ? a.inicio : [],
              homework: a.actividades_cuaderno || "",
              resources: ""
            }));

            let content: any = {};
            if (seq.blocks) {
              let parsedBlocks = [];
              try {
                parsedBlocks = typeof seq.blocks === "string" ? JSON.parse(seq.blocks) : seq.blocks;
              } catch (_) {}
              content = {
                id: seq.id,
                subjectId: seq.subjectId,
                sequenceId: seq.sequenceId,
                sequenceTitle: seq.sequenceTitle,
                duration_weeks: seq.duration_weeks,
                blocks: parsedBlocks
              };
            } else {
              content = {
                id: seq.id,
                subject_id: seq.subjectId || seq.subject_id,
                grade_id: seq.grade_id,
                title: seq.sequenceTitle,
                duration_weeks: seq.duration_weeks,
                activities: formattedActivities
              };
            }

            return {
              id: seq.id,
              subject_id: seq.subjectId,
              grade_id: seq.grade_id || "",
              content: content,
              updated_at: seq.updated_at || new Date().toISOString()
            };
          });

          return jsonResponse(stitched);
        }
      }

      if (method === "POST") {
        if (!body || !body.id || !body.content) {
          return jsonResponse({ error: "Missing required fields" }, 400);
        }

        const { content } = body;

        const seqRow = {
          id: content.id || body.id,
          subjectId: content.subjectId || content.subject_id || body.subject_id,
          sequenceId: content.sequenceId || content.id || body.id,
          sequenceTitle: content.sequenceTitle || content.title || "",
          duration_weeks: content.duration_weeks || 4,
          planning_data: content.planning_data || "",
          blocks: content.blocks ? content.blocks : null,
          grade_id: content.grade_id || body.grade_id,
          updated_at: new Date().toISOString()
        };

        // Save sequence
        const { error: seqErr } = await supabase
          .from("sequences")
          .upsert(seqRow);

        if (seqErr) throw seqErr;

        // Clean old activities
        await supabase
          .from("sequence_activities")
          .delete()
          .eq("sequence_id", seqRow.id);

        // Save activities
        if (content.activities && Array.isArray(content.activities)) {
          for (let i = 0; i < content.activities.length; i++) {
            const act = content.activities[i];
            const { error: actErr } = await supabase
              .from("sequence_activities")
              .insert({
                id: act.id || `${seqRow.id}-act-${i}`,
                sequence_id: seqRow.id,
                order_index: i + 1,
                title: act.title || "",
                name: act.name || "",
                intencion_pedagogica: act.pedagogicalIntention || act.intencion_pedagogica || "",
                estrategia: act.estrategia || "",
                aprendizaje_significativo: act.aprendizaje_significativo || "",
                actividades_complementarias: act.actividades_complementarias || "",
                actividades_cuaderno: act.homework || act.actividades_cuaderno || "",
                inicio: act.moments || act.inicio || [],
                desarrollo: act.desarrollo || [],
                cierre: act.cierre || []
              });

            if (actErr) throw actErr;
          }
        } else if (content.blocks && Array.isArray(content.blocks)) {
          let counter = 1;
          for (let b = 0; b < content.blocks.length; b++) {
            const block = content.blocks[b];
            if (block.activities && Array.isArray(block.activities)) {
              for (let a = 0; a < block.activities.length; a++) {
                const act = block.activities[a];
                const { error: actErr } = await supabase
                  .from("sequence_activities")
                  .insert({
                    id: act.id || `${seqRow.id}-b-${b}-act-${a}`,
                    sequence_id: seqRow.id,
                    order_index: counter++,
                    title: act.title || "",
                    name: act.name || "",
                    intencion_pedagogica: act.pedagogicalIntention || act.intencion_pedagogica || "",
                    estrategia: act.estrategia || "",
                    aprendizaje_significativo: act.aprendizaje_significativo || "",
                    actividades_complementarias: act.actividades_complementarias || "",
                    actividades_cuaderno: act.homework || act.actividades_cuaderno || "",
                    inicio: act.moments || act.inicio || [],
                    desarrollo: act.desarrollo || [],
                    cierre: act.cierre || []
                  });

                if (actErr) throw actErr;
              }
            }
          }
        }

        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && sequenceId) {
        // Clean activities
        await supabase
          .from("sequence_activities")
          .delete()
          .eq("sequence_id", sequenceId);

        // Delete sequence
        const { error: seqErr } = await supabase
          .from("sequences")
          .delete()
          .eq("id", sequenceId);

        if (seqErr) throw seqErr;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 14. CUSTOM UNITS ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/custom-units")) {
      const unitId = parts[2];

      if (method === "GET") {
        const normalizeSubject = (subId: string, gradeLevels: any[]): string => {
          let clean = (subId || "").toLowerCase().trim();
          clean = clean.replace(/-(1ro|2do|3ro|4to|5to|6to)$/, '');
          if (clean === 'ciencias-sociales' || clean === 'sociales') clean = 'sociales';
          else if (clean === 'ciencias-naturaleza' || clean === 'naturales') clean = 'naturales';
          else if (clean === 'formacion-integral-humana-y-religiosa' || clean === 'formacion-humana') clean = 'formacion-humana';
          else if (clean === 'lengua-espanola' || clean === 'lengua') clean = 'lengua-espanola';
          else if (clean === 'matematica') clean = 'matematica';
          else if (clean === 'educacion-artistica') clean = 'educacion-artistica';
          else if (clean === 'educacion-fisica') clean = 'educacion-fisica';

          const isSec = gradeLevels && gradeLevels.length > 0
            ? gradeLevels.some(g => String(g).toLowerCase().includes('sec'))
            : subId.toLowerCase().includes('sec');

          if (isSec) {
            const hasSecCounterpart = [
              'lengua-espanola',
              'matematica',
              'sociales',
              'naturales',
              'educacion-artistica',
              'educacion-fisica',
              'formacion-humana'
            ].includes(clean);
            if (hasSecCounterpart && !clean.endsWith('-sec')) {
              clean = `${clean}-sec`;
            }
          }
          return clean;
        };

        const normalizeGrade = (subId: string, gradeLevels: any[]): string => {
          let g = "";
          if (gradeLevels && gradeLevels.length > 0) {
            g = gradeLevels[0].toLowerCase();
          } else {
            g = subId.toLowerCase();
          }
          if (g.includes('1ro') || g.includes('1er')) return '1ro';
          if (g.includes('2do')) return '2do';
          if (g.includes('3ro') || g.includes('3er')) return '3ro';
          if (g.includes('4to')) return '4to';
          if (g.includes('5to')) return '5to';
          if (g.includes('6to')) return '6to';
          return '2do'; // fallback
        };

        if (unitId) {
          const { data: u, error: unitErr } = await supabase
            .from("units")
            .select("*")
            .eq("id", unitId)
            .single();

          if (unitErr || !u) {
            return jsonResponse({ error: "Unit not found" }, 404);
          }

          const { data: themes } = await supabase
            .from("unit_themes")
            .select("*")
            .eq("unit_id", u.id)
            .order("order", { ascending: true });

          const themeIds = (themes || []).map(t => t.id);
          let subthemes: any[] = [];
          if (themeIds.length > 0) {
            const { data: subs } = await supabase
              .from("unit_subthemes")
              .select("*")
              .in("theme_id", themeIds)
              .order("order", { ascending: true });
            subthemes = subs || [];
          }

          const themesForUnit = themes || [];
          const formattedThemes = themesForUnit.map(t => {
            const subthemesForTheme = subthemes.filter(s => s.theme_id === t.id);
            return {
              id: t.id,
              name: t.title,
              subthemes: subthemesForTheme.map(s => ({
                id: s.id,
                name: s.title
              }))
            };
          });

          const conceptualText = Array.isArray(u.conceptual_content) ? u.conceptual_content.join("\n") : (u.conceptual_content || "");
          const proceduralText = Array.isArray(u.procedural_content) ? u.procedural_content.join("\n") : (u.procedural_content || "");
          const attitudinalText = Array.isArray(u.attitudinal_content) ? u.attitudinal_content.join("\n") : (u.attitudinal_content || "");

          const normSubject = normalizeSubject(u.subject_id, u.grade_levels || []);
          const normGrade = normalizeGrade(u.subject_id, u.grade_levels || []);

          const content = {
            id: u.id,
            name: u.title,
            themes: formattedThemes,
            grade_levels: u.grade_levels || [normGrade],
            subjectId: normSubject,
            week_duration: u.week_duration || 4,
            description: u.description || "",
            achievementIndicators: [],
            conceptual_content: [
              {
                id: `${u.id}-block-1`,
                themes: themesForUnit.map(t => t.title),
                conceptual: conceptualText,
                procedural: proceduralText,
                attitudinal: attitudinalText
              }
            ],
            procedural_content: [],
            attitudinal_content: []
          };

          return jsonResponse({
            id: u.id,
            subject_id: normSubject,
            grade_id: normGrade,
            content: content,
            updated_at: u.updated_at || new Date().toISOString()
          });
        } else {
          const { data: units, error: unitsErr } = await supabase
            .from("units")
            .select("*");

          if (unitsErr) throw unitsErr;

          const { data: themes } = await supabase
            .from("unit_themes")
            .select("*")
            .order("order", { ascending: true });

          // Fetch all subthemes with pagination to bypass the 1000 limit
          let allSubthemes: any[] = [];
          let page = 0;
          const pageSize = 1000;
          let hasMore = true;

          while (hasMore) {
            const { data: subs, error: subsErr } = await supabase
              .from("unit_subthemes")
              .select("*")
              .order("order", { ascending: true })
              .range(page * pageSize, (page + 1) * pageSize - 1);

            if (subsErr) throw subsErr;

            if (!subs || subs.length === 0) {
              hasMore = false;
            } else {
              allSubthemes = [...allSubthemes, ...subs];
              if (subs.length < pageSize) {
                hasMore = false;
              } else {
                page++;
              }
            }
          }

          const stitched = (units || []).map((u: any) => {
            const themesForUnit = (themes || []).filter(t => t.unit_id === u.id);
            const formattedThemes = themesForUnit.map(t => {
              const subthemesForTheme = allSubthemes.filter(s => s.theme_id === t.id);
              return {
                id: t.id,
                name: t.title,
                subthemes: subthemesForTheme.map(s => ({
                  id: s.id,
                  name: s.title
                }))
              };
            });

            const conceptualText = Array.isArray(u.conceptual_content) ? u.conceptual_content.join("\n") : (u.conceptual_content || "");
            const proceduralText = Array.isArray(u.procedural_content) ? u.procedural_content.join("\n") : (u.procedural_content || "");
            const attitudinalText = Array.isArray(u.attitudinal_content) ? u.attitudinal_content.join("\n") : (u.attitudinal_content || "");

            const normSubject = normalizeSubject(u.subject_id, u.grade_levels || []);
            const normGrade = normalizeGrade(u.subject_id, u.grade_levels || []);

            const content = {
              id: u.id,
              name: u.title,
              themes: formattedThemes,
              grade_levels: u.grade_levels || [normGrade],
              subjectId: normSubject,
              week_duration: u.week_duration || 4,
              description: u.description || "",
              achievementIndicators: [],
              conceptual_content: [
                {
                  id: `${u.id}-block-1`,
                  themes: themesForUnit.map(t => t.title),
                  conceptual: conceptualText,
                  procedural: proceduralText,
                  attitudinal: attitudinalText
                }
              ],
              procedural_content: [],
              attitudinal_content: []
            };

            return {
              id: u.id,
              subject_id: normSubject,
              grade_id: normGrade,
              content: content,
              updated_at: u.updated_at || new Date().toISOString()
            };
          });

          return jsonResponse(stitched);
        }
      }

      if (method === "POST") {
        if (!body || !body.id || !body.content) {
          return jsonResponse({ error: "Missing required fields" }, 400);
        }

        const { content } = body;

        // Prepare conceptual, procedural, attitudinal array values
        const conceptualArr = content.conceptual_content ? content.conceptual_content.map((c: any) => c.conceptual) : [];
        const proceduralArr = content.conceptual_content ? content.conceptual_content.map((c: any) => c.procedural) : [];
        const attitudinalArr = content.conceptual_content ? content.conceptual_content.map((c: any) => c.attitudinal) : [];

        const unitRow = {
          id: content.id,
          title: content.name,
          subject_id: content.subjectId || body.subject_id,
          grade_levels: content.grade_levels || [body.grade_id],
          week_duration: content.week_duration || 4,
          description: content.description || "",
          conceptual_content: conceptualArr,
          procedural_content: proceduralArr,
          attitudinal_content: attitudinalArr
        };

        // Save to units
        const { error: unitErr } = await supabase
          .from("units")
          .upsert(unitRow);

        if (unitErr) throw unitErr;

        // Delete existing subthemes & themes for this unit
        const { data: oldThemes } = await supabase
          .from("unit_themes")
          .select("id")
          .eq("unit_id", content.id);

        const oldThemeIds = (oldThemes || []).map(t => t.id);
        if (oldThemeIds.length > 0) {
          await supabase
            .from("unit_subthemes")
            .delete()
            .in("theme_id", oldThemeIds);
        }

        await supabase
          .from("unit_themes")
          .delete()
          .eq("unit_id", content.id);

        // Save new themes & subthemes
        if (Array.isArray(content.themes)) {
          for (let i = 0; i < content.themes.length; i++) {
            const theme = content.themes[i];
            const { error: tErr } = await supabase
              .from("unit_themes")
              .insert({
                id: theme.id,
                unit_id: content.id,
                title: theme.name,
                order: i
              });

            if (tErr) throw tErr;

            if (Array.isArray(theme.subthemes)) {
              for (let j = 0; j < theme.subthemes.length; j++) {
                const subtheme = theme.subthemes[j];
                const { error: sErr } = await supabase
                  .from("unit_subthemes")
                  .insert({
                    id: subtheme.id,
                    theme_id: theme.id,
                    title: subtheme.name,
                    order: j
                  });

                if (sErr) throw sErr;
              }
            }
          }
        }

        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && unitId) {
        // Delete themes/subthemes
        const { data: oldThemes } = await supabase
          .from("unit_themes")
          .select("id")
          .eq("unit_id", unitId);

        const oldThemeIds = (oldThemes || []).map(t => t.id);
        if (oldThemeIds.length > 0) {
          await supabase
            .from("unit_subthemes")
            .delete()
            .in("theme_id", oldThemeIds);
        }

        await supabase
          .from("unit_themes")
          .delete()
          .eq("unit_id", unitId);

        // Delete unit
        const { error: unitErr } = await supabase
          .from("units")
          .delete()
          .eq("id", unitId);

        if (unitErr) throw unitErr;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 15. PLANS ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/plans")) {
      if (method === "GET") {
        const { data, error } = await supabase
          .from("plans")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true });

        if (error) throw error;
        return jsonResponse(data || []);
      }
    }

    // ==========================================
    // 16. EPHEMERIDES ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/ephemerides")) {
      const ephemerisId = parts[2];

      if (method === "GET") {
        const month = query.month;
        const day = query.day;
        
        let q = supabase.from("ephemerides").select("*");
        
        if (day && month) {
          q = q.eq("day", Number(day)).eq("month", Number(month));
        } else if (month) {
          q = q.eq("month", Number(month));
        }
        
        const { data, error } = await q.order("day", { ascending: true });
        if (error) throw error;
        return jsonResponse(data || []);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing ephemeris ID or body" }, 400);
        }

        const { error } = await supabase
          .from("ephemerides")
          .upsert({
            id: body.id,
            day: Number(body.day),
            month: Number(body.month),
            title: body.title || "",
            description: body.description || "",
            is_holiday: body.is_holiday ? true : false,
            category: body.category || "EDUCATIVA"
          });

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && ephemerisId) {
        const { error } = await supabase
          .from("ephemerides")
          .delete()
          .eq("id", ephemerisId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 17. MONTHLY VALUES ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/monthly-values")) {
      if (method === "GET") {
        const month = query.month;
        if (!month) {
          const { data, error } = await supabase.from("monthly_values").select("*");
          if (error) throw error;
          return jsonResponse(data || []);
        }

        const { data, error } = await supabase
          .from("monthly_values")
          .select("*")
          .eq("month", Number(month))
          .maybeSingle();

        if (error) throw error;
        return jsonResponse(data || null);
      }

      if (method === "POST") {
        if (!body || body.month === undefined) {
          return jsonResponse({ error: "Missing month or body" }, 400);
        }

        const { error } = await supabase
          .from("monthly_values")
          .upsert({
            month: Number(body.month),
            value_name: body.value_name || "",
            updated_at: new Date().toISOString()
          }, { onConflict: "month" });

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // 18. COORDINATOR ENDPOINTS
    // ==========================================
    if (path.startsWith("/api/coordinator/logs")) {
      const logId = parts[3];

      if (method === "GET") {
        const coordinatorId = query.coordinator_id;
        if (!coordinatorId) {
          return jsonResponse({ error: "coordinator_id is required" }, 400);
        }
        const { data, error } = await supabase
          .from("coordinator_logs")
          .select("*")
          .eq("coordinator_id", coordinatorId)
          .order("date", { ascending: false })
          .order("time", { ascending: false });

        if (error) throw error;
        return jsonResponse(data || []);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing log ID" }, 400);
        }
        const logRow = {
          id: body.id,
          coordinator_id: body.coordinator_id,
          date: body.date,
          time: body.time,
          category: body.category,
          description: body.description,
          involved_people: body.involved_people || null,
          status: body.status || "Pendiente",
          evidence_url: body.evidence_url || null,
          created_at: body.created_at || new Date().toISOString()
        };
        const { error } = await supabase
          .from("coordinator_logs")
          .upsert(logRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && logId) {
        const { error } = await supabase
          .from("coordinator_logs")
          .delete()
          .eq("id", logId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    if (path.startsWith("/api/coordinator/observations")) {
      const obsId = parts[3];

      if (method === "GET") {
        const coordinatorId = query.coordinator_id;
        const teacherId = query.teacher_id;
        let q = supabase.from("coordinator_observations").select("*");
        if (coordinatorId) {
          q = q.eq("coordinator_id", coordinatorId);
        } else if (teacherId) {
          q = q.eq("teacher_id", teacherId);
        } else {
          return jsonResponse({ error: "coordinator_id or teacher_id is required" }, 400);
        }
        const { data, error } = await q.order("observation_date", { ascending: false });
        if (error) throw error;
        return jsonResponse(data || []);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing observation ID" }, 400);
        }
        const obsRow = {
          id: body.id,
          coordinator_id: body.coordinator_id,
          teacher_id: body.teacher_id,
          observation_date: body.observation_date,
          next_observation_date: body.next_observation_date || null,
          score: body.score || 0,
          status: body.status || "Pendiente",
          observations: body.observations || null,
          positive_feedback: body.positive_feedback || null,
          areas_of_improvement: body.areas_of_improvement || null,
          created_at: body.created_at || new Date().toISOString()
        };
        const { error } = await supabase
          .from("coordinator_observations")
          .upsert(obsRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE" && obsId) {
        const { error } = await supabase
          .from("coordinator_observations")
          .delete()
          .eq("id", obsId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    if (path.startsWith("/api/coordinator/agreements")) {
      if (method === "GET") {
        const coordinatorId = query.coordinator_id;
        const teacherId = query.teacher_id;
        let q = supabase.from("coordinator_agreements").select("*");
        if (coordinatorId) {
          q = q.eq("coordinator_id", coordinatorId);
        } else if (teacherId) {
          q = q.eq("teacher_id", teacherId);
        } else {
          return jsonResponse({ error: "coordinator_id or teacher_id is required" }, 400);
        }
        const { data, error } = await q;
        if (error) throw error;
        return jsonResponse(data || []);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing agreement ID" }, 400);
        }
        const agreementRow = {
          id: body.id,
          observation_id: body.observation_id || null,
          teacher_id: body.teacher_id,
          coordinator_id: body.coordinator_id,
          agreement_text: body.agreement_text,
          status: body.status || "Pendiente",
          due_date: body.due_date || null,
          created_at: body.created_at || new Date().toISOString()
        };
        const { error } = await supabase
          .from("coordinator_agreements")
          .upsert(agreementRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    if (path.startsWith("/api/coordinator/meetings")) {
      if (method === "GET") {
        const coordinatorId = query.coordinator_id;
        if (!coordinatorId) {
          return jsonResponse({ error: "coordinator_id is required" }, 400);
        }
        const { data, error } = await supabase
          .from("coordinator_meetings")
          .select("*")
          .eq("coordinator_id", coordinatorId)
          .order("meeting_date", { ascending: false });

        if (error) throw error;
        return jsonResponse(data || []);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing meeting ID" }, 400);
        }
        const meetingRow = {
          id: body.id,
          coordinator_id: body.coordinator_id,
          title: body.title,
          meeting_date: body.meeting_date,
          meeting_time: body.meeting_time,
          location: body.location || null,
          invited_count: body.invited_count || 0,
          notes: body.notes || null,
          created_at: body.created_at || new Date().toISOString()
        };
        const { error } = await supabase
          .from("coordinator_meetings")
          .upsert(meetingRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    if (path.startsWith("/api/coordinator/minutes")) {
      if (method === "GET") {
        const coordinatorId = query.coordinator_id;
        if (!coordinatorId) {
          return jsonResponse({ error: "coordinator_id is required" }, 400);
        }
        const { data, error } = await supabase
          .from("coordinator_meeting_minutes")
          .select("id, meeting_id, title, content, participants, pending_signatures, created_at, coordinator_meetings!inner(coordinator_id)")
          .eq("coordinator_meetings.coordinator_id", coordinatorId);

        if (error) throw error;

        const mapped = (data || []).map((row: any) => {
          const { coordinator_meetings, ...rest } = row;
          return rest;
        });

        return jsonResponse(mapped);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing minutes ID" }, 400);
        }
        const minutesRow = {
          id: body.id,
          meeting_id: body.meeting_id,
          title: body.title,
          content: body.content || null,
          participants: body.participants || null,
          pending_signatures: body.pending_signatures || 0,
          created_at: body.created_at || new Date().toISOString()
        };
        const { error } = await supabase
          .from("coordinator_meeting_minutes")
          .upsert(minutesRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    if (path.startsWith("/api/coordinator/followups")) {
      if (method === "GET") {
        const coordinatorId = query.coordinator_id;
        if (!coordinatorId) {
          return jsonResponse({ error: "coordinator_id is required" }, 400);
        }
        const { data, error } = await supabase
          .from("coordinator_student_followups")
          .select("*")
          .eq("coordinator_id", coordinatorId);

        if (error) throw error;
        return jsonResponse(data || []);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing followup ID" }, 400);
        }
        const followupRow = {
          id: body.id,
          coordinator_id: body.coordinator_id,
          student_id: body.student_id,
          reason: body.reason,
          responsible_id: body.responsible_id || null,
          last_intervention_date: body.last_intervention_date || null,
          status: body.status || "Pendiente",
          notes: body.notes || null,
          created_at: body.created_at || new Date().toISOString()
        };
        const { error } = await supabase
          .from("coordinator_student_followups")
          .upsert(followupRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    if (path.startsWith("/api/coordinator/evidences")) {
      if (method === "GET") {
        const coordinatorId = query.coordinator_id;
        if (!coordinatorId) {
          return jsonResponse({ error: "coordinator_id is required" }, 400);
        }
        const { data, error } = await supabase
          .from("coordinator_evidences")
          .select("*")
          .eq("coordinator_id", coordinatorId);

        if (error) throw error;
        return jsonResponse(data || []);
      }

      if (method === "POST") {
        if (!body || !body.id) {
          return jsonResponse({ error: "Missing evidence ID" }, 400);
        }
        const evidenceRow = {
          id: body.id,
          coordinator_id: body.coordinator_id,
          teacher_id: body.teacher_id || null,
          name: body.name,
          file_url: body.file_url,
          category: body.category,
          file_tag: body.file_tag || null,
          created_at: body.created_at || new Date().toISOString()
        };
        const { error } = await supabase
          .from("coordinator_evidences")
          .upsert(evidenceRow);

        if (error) throw error;
        return jsonResponse({ success: true });
      }

      if (method === "DELETE") {
        const evidenceId = parts[3];
        if (!evidenceId) {
          return jsonResponse({ error: "Missing evidence ID" }, 400);
        }
        const { error } = await supabase
          .from("coordinator_evidences")
          .delete()
          .eq("id", evidenceId);

        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // Route not matched
    return jsonResponse({ error: "Not Found" }, 404);
  } catch (err: any) {
    console.error("Local Supabase router exception:", err);
    return jsonResponse({ error: err.message || "Internal Server Error" }, 500);
  }
}

// -------------------------------------------------------------
// WINDOW.FETCH INTERCEPTOR INJECTION
// -------------------------------------------------------------
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    const urlString = typeof input === "string" ? input : (input as Request).url;
    
    // Check if the URL points to any Cloudflare Worker API routes or relative API calls
    const isApiCall = 
      urlString.includes("localhost:8787/api/") ||
      urlString.includes("planix-api.yeriorlando00.workers.dev/api/") ||
      urlString.startsWith("/api/") ||
      (urlString.startsWith(window.location.origin) && urlString.includes("/api/"));

    if (isApiCall && !urlString.includes("/api/log-terminal")) {
      try {
        return await handleLocalSupabaseRequest(urlString, init);
      } catch (err: any) {
        console.error("Local Supabase router error intercepting fetch:", err);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    
    return originalFetch.apply(this, arguments as any);
  };
}

// -------------------------------------------------------------
// BACKWARD COMPATIBLE REQUEST CALLER
// -------------------------------------------------------------
export async function requestD1<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let userId = "";
  const savedUser = localStorage.getItem("plx:user");
  if (savedUser) {
    try {
      const userObj = JSON.parse(savedUser);
      if (userObj && userObj.id) {
        userId = userObj.id;
      }
    } catch (_) {}
  }

  if (!userId) {
    const sessionStr = localStorage.getItem("plx:session");
    if (sessionStr) {
      try {
        const sessionObj = JSON.parse(sessionStr);
        if (sessionObj && sessionObj.user_id) {
          userId = sessionObj.user_id;
        }
      } catch (_) {}
    }
  }

  if (userId) {
    headers["Authorization"] = `Bearer ${userId}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error de conexión con la base de datos (HTTP ${response.status})`);
  }

  return response.json() as Promise<T>;
}
