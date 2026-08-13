import { createClient } from "@supabase/supabase-js";
import {
  SOCIALES_PROMPT,
  NATURALES_PROMPT,
  ARTISTICA_PROMPT,
  FISICA_PROMPT,
  FORMACION_PROMPT,
  FALLBACK_PROMPT
} from "../lib/services/prompts/subjectPrompts";

export interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  RESEND_API_KEY?: string;
  POLAR_WEBHOOK_SECRET?: string;
  POLAR_API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const jsonResponse = (data: any, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    };

    const getRequestBody = async () => {
      try {
        return await request.json();
      } catch {
        return null;
      }
    };

    // Initialize Supabase Client
    const supabaseUrl = env.SUPABASE_URL || "https://api.planix.do/";
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseKey) {
      return jsonResponse({ error: "Supabase Service Role Key is missing on the server." }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    try {
      // ==========================================
      // 1. PROFILES ENDPOINTS
      // ==========================================
      if (path.startsWith("/api/profiles")) {
        const parts = path.split("/").filter(Boolean);
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

            // Auto-generate referral code if missing for existing users
            if (!row.referral_code) {
              try {
                const code = generateReferralCode();
                await supabase
                  .from("profiles")
                  .update({ referral_code: code })
                  .eq("id", profileId);
                row.referral_code = code;
              } catch (err) {
                console.error("Error auto-generating referral code on fetch:", err);
              }
            }

            // Parse JSON fields (with double-encoded fallback parsing for safety)
            if (row.allowed_subjects) {
              if (typeof row.allowed_subjects === "string") {
                try { row.allowed_subjects = JSON.parse(row.allowed_subjects); } catch (_) {}
              }
              if (typeof row.allowed_subjects === "string") {
                try { row.allowed_subjects = JSON.parse(row.allowed_subjects); } catch (_) {}
              }
            }
            if (row.preferences) {
              if (typeof row.preferences === "string") {
                try { row.preferences = JSON.parse(row.preferences); } catch (_) {}
              }
              if (typeof row.preferences === "string") {
                try { row.preferences = JSON.parse(row.preferences); } catch (_) {}
              }
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
              if (row.allowed_subjects) {
                if (typeof row.allowed_subjects === "string") {
                  try { row.allowed_subjects = JSON.parse(row.allowed_subjects); } catch (_) {}
                }
                if (typeof row.allowed_subjects === "string") {
                  try { row.allowed_subjects = JSON.parse(row.allowed_subjects); } catch (_) {}
                }
              }
              if (row.preferences) {
                if (typeof row.preferences === "string") {
                  try { row.preferences = JSON.parse(row.preferences); } catch (_) {}
                }
                if (typeof row.preferences === "string") {
                  try { row.preferences = JSON.parse(row.preferences); } catch (_) {}
                }
              }
            });

            return jsonResponse(results || []);
          }
        }

        if (method === "POST") {
          const body: any = await getRequestBody();
          if (!body || !body.id) {
            return jsonResponse({ error: "Missing profile ID or body" }, 400);
          }

          // 1. Check if profile exists before inserting/updating
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
            referralCode = generateReferralCode();
          }

          let referredBy = oldProfile?.referred_by || null;
          let extraCredits = 0;

          // If new profile and referred_by_code is supplied
          if (!oldProfile && body.referred_by_code) {
            try {
              const { data: referrer } = await supabase
                .from("profiles")
                .select("id, credits")
                .eq("referral_code", body.referred_by_code)
                .single();

              if (referrer && referrer.id !== body.id) {
                referredBy = referrer.id;

                // Load settings from site_configs
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

                // Store referred credits to add to new profile
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
            // New user: add their welcome extra credits
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
              console.error("Error looking up school metadata in profiles API:", schoolErr);
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
            last_login: body.last_login !== undefined ? body.last_login : (oldProfile?.last_login || null),
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

          // Send emails in the background using Resend if API key is present
          console.log(`[PROFILE_EMAIL_DEBUG] Checking email trigger. RESEND_API_KEY present: ${!!env.RESEND_API_KEY}`);
          if (env.RESEND_API_KEY) {
            const email = body.email || "";
            const name = body.full_name || body.nombre || "";
            const newTier = body.subscription_tier || body.suscripcion || "free";
            const oldTier = oldProfile?.subscription_tier || "free";
            
            console.log(`[PROFILE_EMAIL_DEBUG] User: ${email}, Name: ${name}, oldTier: ${oldTier}, newTier: ${newTier}, hasOldProfile: ${!!oldProfile}`);
            
            if (email && email.toLowerCase() !== "docente@planix.do") {
              if (!oldProfile) {
                console.log(`[PROFILE_EMAIL_DEBUG] Brand new user registration, triggering sendWelcomeEmail`);
                ctx.waitUntil(
                  sendWelcomeEmail(email, name, env.RESEND_API_KEY)
                    .catch(e => console.error("Welcome email error:", e))
                );
              } else {
                if (oldTier !== "pro" && newTier === "pro") {
                  console.log(`[PROFILE_EMAIL_DEBUG] User upgraded to PRO! Triggering sendProWelcomeEmail`);
                  const expiry = body.subscription_expiry || body.suscripcion_hasta || new Date(Date.now() + 30 * 86400000).toISOString();
                  ctx.waitUntil(
                    sendProWelcomeEmail(email, name, expiry, env.RESEND_API_KEY)
                      .catch(e => console.error("PRO welcome email error:", e))
                  );
                } else {
                  console.log(`[PROFILE_EMAIL_DEBUG] No transition to PRO. oldTier: ${oldTier}, newTier: ${newTier}`);
                }
              }
            }
          }

          return jsonResponse({ success: true });
        }

        // Update password only
        if (method === "PUT" && profileId && parts[3] === "password") {
          const body: any = await getRequestBody();
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

        // Delete profile and cascade deletes
        if (method === "DELETE" && profileId) {
          // Manually handle deletes of cascading tables to be safe
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
      // 1.5. SCHOOLS ENDPOINTS
      // ==========================================
      if (path.startsWith("/api/schools")) {
        if (method === "GET") {
          const search = url.searchParams.get("search");
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

          // Unique filter in memory to emulate SQLite GROUP BY query
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
      // 2. CLASSROOMS ENDPOINTS
      // ==========================================
      if (path.startsWith("/api/classrooms")) {
        const parts = path.split("/").filter(Boolean);
        const classroomId = parts[2];

        if (method === "GET") {
          const teacherId = url.searchParams.get("teacher_id");
          let query = supabase.from("classrooms").select("*");

          if (teacherId) {
            query = query.eq("teacher_id", teacherId);
          }
          const { data, error } = await query.order("name", { ascending: true });

          if (error) throw error;
          return jsonResponse(data || []);
        }

        if (method === "POST") {
          const body: any = await getRequestBody();
          if (!body || !body.id) {
            return jsonResponse({ error: "Missing classroom ID or body" }, 400);
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
      // 3. STUDENTS ENDPOINTS
      // ==========================================
      if (path.startsWith("/api/students")) {
        const parts = path.split("/").filter(Boolean);
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

          const classroomId = url.searchParams.get("classroom_id");
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
          const body: any = await getRequestBody();
          if (!body || !body.id) {
            return jsonResponse({ error: "Missing student ID or body" }, 400);
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
      // 4. ATTENDANCE ENDPOINTS
      // ==========================================
      if (path.startsWith("/api/attendance")) {
        if (method === "GET") {
          const classroomId = url.searchParams.get("classroom_id");
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
          const body: any = await getRequestBody();
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
          const classroomId = url.searchParams.get("classroom_id");
          const date = url.searchParams.get("date");
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
      // 5. PLANNINGS ENDPOINTS
      // ==========================================
      if (path.startsWith("/api/plannings")) {
        const parts = path.split("/").filter(Boolean);
        const planningId = parts[2];

        if (method === "GET") {
          const userId = url.searchParams.get("user_id");
          let query = supabase.from("plannings").select("*");

          if (userId) {
            query = query.eq("user_id", userId);
          }
          const { data, error } = await query.order("created_at", { ascending: false });

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
          const body: any = await getRequestBody();
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
            content: body.content || {},
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
      // 6. RUBRICS & METADATA ENDPOINTS
      // ==========================================
      if (path.startsWith("/api/rubrics")) {
        const parts = path.split("/").filter(Boolean);
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

          const teacherId = url.searchParams.get("teacher_id");
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
          const body: any = await getRequestBody();
          if (!body || !body.id) {
            return jsonResponse({ error: "Missing rubric ID or body" }, 400);
          }

          const rubricRow = {
            id: body.id,
            teacher_id: body.teacher_id,
            title: body.title || "",
            description: body.description || "",
            subject_id: body.subject_id || "GENERAL",
            criteria: body.criteria || [],
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

      // Rubric Classroom Metadata
      if (path.startsWith("/api/rubric-metadata")) {
        if (method === "GET") {
          const rubricId = url.searchParams.get("rubric_id");
          const classroomId = url.searchParams.get("classroom_id");
          if (!rubricId || !classroomId) {
            return jsonResponse({ error: "rubric_id and classroom_id are required" }, 400);
          }

          const { data: row, error } = await supabase
            .from("rubric_classroom_metadata")
            .select("*")
            .eq("rubric_id", rubricId)
            .eq("classroom_id", classroomId)
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
          const body: any = await getRequestBody();
          if (!body || !body.rubric_id || !body.classroom_id) {
            return jsonResponse({ error: "Missing rubric_id or classroom_id" }, 400);
          }

          const metadataRow = {
            rubric_id: body.rubric_id,
            classroom_id: body.classroom_id,
            indicators: body.indicators || [],
            competencies: body.competencies || [],
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
      // 7. STUDENT EVALUATIONS ENDPOINTS
      // ==========================================
      if (path.startsWith("/api/student-evaluations")) {
        const parts = path.split("/").filter(Boolean);
        const evalId = parts[2];

        if (method === "GET") {
          const rubricId = url.searchParams.get("rubric_id");
          const studentId = url.searchParams.get("student_id");
          
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
          const body: any = await getRequestBody();
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
      // 8. ANECDOTAL RECORDS & INCIDENTS
      // ==========================================
      if (path.startsWith("/api/anecdotal-records")) {
        const parts = path.split("/").filter(Boolean);
        const recordId = parts[2];

        if (method === "GET") {
          const classroomId = url.searchParams.get("classroom_id");
          const studentId = url.searchParams.get("student_id");
          
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
          const body: any = await getRequestBody();
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
        const parts = path.split("/").filter(Boolean);
        const incidentId = parts[2];

        if (method === "GET") {
          const studentId = url.searchParams.get("student_id");
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
          const body: any = await getRequestBody();
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
      // 9. OFFICIAL GRADES & SUMMARIES
      // ==========================================
      if (path.startsWith("/api/official-grades")) {
        if (method === "GET") {
          const classroomId = url.searchParams.get("classroom_id");
          const subjectId = url.searchParams.get("subject_id");
          if (!classroomId) {
            return jsonResponse({ error: "classroom_id is required" }, 400);
          }

          let query = supabase.from("official_grades").select("*").eq("classroom_id", classroomId);
          if (subjectId) {
            query = query.eq("subject_id", subjectId);
          }
          const { data, error } = await query;

          if (error) throw error;
          return jsonResponse(data || []);
        }

        if (method === "POST") {
          const body: any = await getRequestBody();
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
          const body: any = await getRequestBody();
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
        const parts = path.split("/").filter(Boolean);
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
          const body: any = await getRequestBody();
          if (!body || !body.key) {
            return jsonResponse({ error: "Missing config key or body" }, 400);
          }

          const configRow = {
            key: body.key,
            value: body.value,
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
      // 11.5. COMMUNITY POSTS ENDPOINTS
      // ==========================================
      if (path.startsWith("/api/community-posts")) {
        const parts = path.split("/").filter(Boolean);
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
            
            // Parse JSON fields
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
          const body: any = await getRequestBody();
          if (!body || !body.id) {
            return jsonResponse({ error: "Missing post ID or body" }, 400);
          }

          if (postId && parts[3] === "view") {
            // First try calling the RPC
            const { error: rpcError } = await supabase.rpc("record_post_view", { post_id: postId });
            if (rpcError) {
              // Fallback to fetch + increment
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
            liked_by: body.liked_by || [],
            bookmarked_by: body.bookmarked_by || [],
            creado_en: body.creado_en || new Date().toISOString(),
            comentarios: body.comentarios || [],
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
      // 11.6. CUSTOM SEQUENCES ENDPOINTS
      // ==========================================
      if (path.startsWith("/api/custom-sequences")) {
        const parts = path.split("/").filter(Boolean);
        const sequenceId = parts[2]; // /api/custom-sequences/:id

        // Auth Role check helper
        const checkAdmin = async () => {
          const authHeader = request.headers.get("Authorization");
          if (!authHeader) return false;
          const userId = authHeader.replace("Bearer ", "").trim();
          if (!userId) return false;
          
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", userId)
              .single();
            
            if (!profile) return false;
            const r = (profile.role || "").toLowerCase().trim();
            return r === "admin" || r === "administrador" || r === "administrador_curriculo";
          } catch (e) {
            console.error("Error checking admin profile:", e);
            return false;
          }
        };

        if (method === "POST" || method === "DELETE") {
          const isAdmin = await checkAdmin();
          if (!isAdmin) {
            return jsonResponse({ error: "Acceso denegado. Se requiere rol de administrador." }, 403);
          }
        }

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
          const body: any = await getRequestBody();
          if (!body || !body.id || !body.subject_id || !body.grade_id || !body.content) {
            return jsonResponse({ error: "Missing required fields (id, subject_id, grade_id, content)" }, 400);
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
      // 11.7. CUSTOM UNITS ENDPOINTS
      // ==========================================
      if (path.startsWith("/api/custom-units")) {
        const parts = path.split("/").filter(Boolean);
        const unitId = parts[2]; // /api/custom-units/:id

        // Auth Role check
        const checkAdmin = async () => {
          const authHeader = request.headers.get("Authorization");
          if (!authHeader) return false;
          const userId = authHeader.replace("Bearer ", "").trim();
          if (!userId) return false;
          
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", userId)
              .single();
            
            if (!profile) return false;
            const r = (profile.role || "").toLowerCase().trim();
            return r === "admin" || r === "administrador" || r === "administrador_curriculo";
          } catch (e) {
            console.error("Error checking admin profile:", e);
            return false;
          }
        };

        if (method === "POST" || method === "DELETE") {
          const isAdmin = await checkAdmin();
          if (!isAdmin) {
            return jsonResponse({ error: "Acceso denegado. Se requiere rol de administrador." }, 403);
          }
        }

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
          const body: any = await getRequestBody();
          if (!body || !body.id || !body.subject_id || !body.grade_id || !body.content) {
            return jsonResponse({ error: "Missing required fields (id, subject_id, grade_id, content)" }, 400);
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
      // 12. PLANS ENDPOINTS
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
      // POLAR WEBHOOKS ENDPOINT
      // ==========================================
      if (path.startsWith("/api/webhooks/polar")) {
        if (method !== "POST") {
          return jsonResponse({ error: "Method Not Allowed" }, 405);
        }
        
        const payload = await request.text();
        const signature = request.headers.get("webhook-signature");
        const isValid = await verifyPolarSignature(payload, signature, env.POLAR_WEBHOOK_SECRET);
        
        if (!isValid) {
          return jsonResponse({ error: "Firma inválida" }, 401);
        }
        
        try {
          const event = JSON.parse(payload);
          const { type, data } = event;
          
          let userId = data.metadata?.user_id || data.checkout_metadata?.user_id;
          let customerEmail = data.customer?.email || "";
          
          if (!userId && customerEmail) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("id")
              .eq("email", customerEmail)
              .maybeSingle();
            userId = profile?.id;
          }
          
          if (!userId) {
            return jsonResponse({ error: "Usuario no encontrado" }, 400);
          }
          
          if (type === "subscription.created" || type === "subscription.updated" || type === "order.created") {
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1); // 30 days
            const expiryStr = expiryDate.toISOString();
            
            // Get old profile to check if upgrading
            const { data: oldProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .maybeSingle();
            
            if (oldProfile) {
              const { error: updateError } = await supabase
                .from("profiles")
                .update({
                  subscription_tier: "pro",
                  subscription_status: "ACTIVO",
                  subscription_expiry: expiryStr,
                  updated_at: new Date().toISOString()
                })
                .eq("id", userId);
              
              if (updateError) throw updateError;
              
              if (env.RESEND_API_KEY && oldProfile.subscription_tier !== 'pro') {
                ctx.waitUntil(
                  sendProWelcomeEmail(oldProfile.email, oldProfile.full_name, expiryStr, env.RESEND_API_KEY)
                    .catch(e => console.error("Webhook PRO email error:", e))
                );
              }
            }
          }
          
          return jsonResponse({ received: true });
        } catch (e: any) {
          return jsonResponse({ error: e.message }, 500);
        }
      }

      // ==========================================
      // INSTANT ACTIVATION ENDPOINT
      // ==========================================
      if (path.startsWith("/api/suscripcion/instant-activate")) {
        if (method !== "POST") {
          return jsonResponse({ error: "Method Not Allowed" }, 405);
        }
        
        const body = await getRequestBody();
        if (!body || !body.checkout_id || !body.user_id) {
          return jsonResponse({ error: "Missing checkout_id or user_id" }, 400);
        }
        
        const { checkout_id, user_id } = body;
        
        // 1. Verify checkout state on Polar
        let checkoutSucceeded = false;
        let customerEmail = "";
        
        try {
          const res = await fetch(`https://api.polar.sh/api/v1/checkouts/custom-client/client/${checkout_id}`);
          if (res.ok) {
            const data: any = await res.json();
            if (data.status === "succeeded" || data.status === "confirmed") {
              checkoutSucceeded = true;
              customerEmail = data.customer_email || "";
            }
          }
        } catch (err) {
          console.error("Polar client API check failed, trying authenticated:", err);
        }
        
        if (!checkoutSucceeded && env.POLAR_API_KEY) {
          try {
            const res = await fetch(`https://api.polar.sh/api/v1/checkouts/${checkout_id}`, {
              headers: {
                "Authorization": `Bearer ${env.POLAR_API_KEY}`
              }
            });
            if (res.ok) {
              const data: any = await res.json();
              if (data.status === "succeeded" || data.status === "confirmed") {
                checkoutSucceeded = true;
                customerEmail = data.customer_email || "";
              }
            }
          } catch (err) {
            console.error("Polar auth API check failed:", err);
          }
        }
        
        // Fallback: If no API key is configured or Polar service is unreachable, we activate in dev mode
        if (!checkoutSucceeded && !env.POLAR_API_KEY) {
          console.log("No POLAR_API_KEY configured, activating using fallback validation.");
          checkoutSucceeded = true;
        }
        
        if (!checkoutSucceeded) {
          return jsonResponse({ error: "El pago no pudo ser verificado en los servidores de Polar" }, 400);
        }
        
        // 2. Perform the upgrade
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 30 days
        const expiryStr = expiryDate.toISOString();
        
        const { data: oldProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user_id)
          .maybeSingle();
        
        if (!oldProfile) {
          return jsonResponse({ error: "Usuario no encontrado" }, 404);
        }
        
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            subscription_tier: "pro",
            subscription_status: "ACTIVO",
            subscription_expiry: expiryStr,
            updated_at: new Date().toISOString()
          })
          .eq("id", user_id);
        
        if (updateError) throw updateError;
        
        if (env.RESEND_API_KEY && oldProfile.subscription_tier !== 'pro') {
          ctx.waitUntil(
            sendProWelcomeEmail(oldProfile.email, oldProfile.full_name, expiryStr, env.RESEND_API_KEY)
              .catch(e => console.error("Instant activation PRO email error:", e))
          );
        }
        
        return jsonResponse({ success: true });
      }

      // Default route not found
          return jsonResponse({ error: "Not Found" }, 404);
    } catch (err: any) {
      console.error(err);
      return jsonResponse({ error: err.message || "Internal Server Error" }, 500);
    }
  },
};

function getWelcomeEmailTemplate(userName: string): string {
  const primaryColor = '#0046ab';
  const bgColor = '#FBF9F6';
  const PLANIX_URL = 'https://planix.do';
  
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a Planix!</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${bgColor};">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 10px 30px -5px rgba(27,27,27,0.08); border: 1px solid rgba(27,27,27,0.05);">
                    
                    <!-- Header with Logo on White Background -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background-color: #ffffff; border-bottom: 5px solid ${primaryColor};">
                            <div style="display: inline-block; padding: 15px 30px; background-color: #ffffff; border-radius: 12px;">
                                <img src="https://planix.do/Logo-login-y-landing.webp" alt="Planix Logo" style="height: 70px; width: auto; display: block;">
                            </div>
                            <p style="margin: 15px 0 0; font-size: 15px; color: #7E7E7E; font-weight: 600; letter-spacing: 0.5px; font-family: 'Outfit', sans-serif;">
                                Planificación Inteligente para Docentes Dominicanos
                            </p>
                        </td>
                    </tr>

                    <!-- Welcome Message -->
                    <tr>
                        <td style="padding: 45px 40px 30px;">
                            <h2 style="margin: 0 0 15px; font-size: 28px; font-weight: 800; color: #1B1B1B; text-align: center; font-family: 'Outfit', sans-serif;">
                                🎉 ¡Bienvenido${userName ? `, ${userName}` : ''}!
                            </h2>
                            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #7E7E7E; text-align: center; font-family: 'Outfit', sans-serif;">
                                Tu cuenta ha sido creada exitosamente. Prepárate para transformar tu práctica docente con las herramientas más potentes del mercado.
                            </p>
                        </td>
                    </tr>

                    <!-- Features Section Header -->
                    <tr>
                        <td style="padding: 20px 40px 10px;">
                            <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 2px; text-align: center; font-family: 'Outfit', sans-serif;">
                                Herramientas diseñadas para ti
                            </h3>
                        </td>
                    </tr>

                    <!-- Column Features Grid -->
                    <tr>
                        <td style="padding: 20px 30px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td width="33.33%" valign="top" style="padding: 10px;">
                                        <div style="background: #ffffff; border: 1px solid rgba(27,27,27,0.06); border-radius: 20px; padding: 15px; text-align: center; min-height: 140px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);">
                                            <div style="font-size: 24px; margin-bottom: 10px;">⚡</div>
                                            <h4 style="margin: 0 0 8px; font-size: 13px; font-weight: 800; color: #1B1B1B; font-family: 'Outfit', sans-serif;">Planificación IA</h4>
                                            <p style="margin: 0; font-size: 11px; color: #7E7E7E; line-height: 1.4; font-family: 'Outfit', sans-serif;">Planes de alto impacto alineados al currículo en segundos.</p>
                                        </div>
                                    </td>
                                    <td width="33.33%" valign="top" style="padding: 10px;">
                                        <div style="background: #ffffff; border: 1px solid rgba(27,27,27,0.06); border-radius: 20px; padding: 15px; text-align: center; min-height: 140px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);">
                                            <div style="font-size: 24px; margin-bottom: 10px;">📄</div>
                                            <h4 style="margin: 0 0 8px; font-size: 13px; font-weight: 800; color: #1B1B1B; font-family: 'Outfit', sans-serif;">Exámenes IA</h4>
                                            <p style="margin: 0; font-size: 11px; color: #7E7E7E; line-height: 1.4; font-family: 'Outfit', sans-serif;">Evaluaciones profesionales con hojas de respuesta.</p>
                                        </div>
                                    </td>
                                    <td width="33.33%" valign="top" style="padding: 10px;">
                                        <div style="background: #ffffff; border: 1px solid rgba(27,27,27,0.06); border-radius: 20px; padding: 15px; text-align: center; min-height: 140px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);">
                                            <div style="font-size: 24px; margin-bottom: 10px;">✏️</div>
                                            <h4 style="margin: 0 0 8px; font-size: 13px; font-weight: 800; color: #1B1B1B; font-family: 'Outfit', sans-serif;">Pizarra</h4>
                                            <p style="margin: 0; font-size: 11px; color: #7E7E7E; line-height: 1.4; font-family: 'Outfit', sans-serif;">Mapas conceptuales y esquemas dinámicos por IA.</p>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="33.33%" valign="top" style="padding: 10px;">
                                        <div style="background: #ffffff; border: 1px solid rgba(27,27,27,0.06); border-radius: 20px; padding: 15px; text-align: center; min-height: 140px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);">
                                            <div style="font-size: 24px; margin-bottom: 10px;">❤️</div>
                                            <h4 style="margin: 0 0 8px; font-size: 13px; font-weight: 800; color: #1B1B1B; font-family: 'Outfit', sans-serif;">Bienestar</h4>
                                            <p style="margin: 0; font-size: 11px; color: #7E7E7E; line-height: 1.4; font-family: 'Outfit', sans-serif;">Estrategias de gestión de aula y apoyo emocional.</p>
                                        </div>
                                    </td>
                                    <td width="33.33%" valign="top" style="padding: 10px;">
                                        <div style="background: #ffffff; border: 1px solid rgba(27,27,27,0.06); border-radius: 20px; padding: 15px; text-align: center; min-height: 140px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);">
                                            <div style="font-size: 24px; margin-bottom: 10px;">🎯</div>
                                            <h4 style="margin: 0 0 8px; font-size: 13px; font-weight: 800; color: #1B1B1B; font-family: 'Outfit', sans-serif;">Investigación</h4>
                                            <p style="margin: 0; font-size: 11px; color: #7E7E7E; line-height: 1.4; font-family: 'Outfit', sans-serif;">Información educativa relevante y resúmenes.</p>
                                        </div>
                                    </td>
                                    <td width="33.33%" valign="top" style="padding: 10px;">
                                        <div style="background: #ffffff; border: 1px solid rgba(27,27,27,0.06); border-radius: 20px; padding: 15px; text-align: center; min-height: 140px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);">
                                            <div style="font-size: 24px; margin-bottom: 10px;">💡</div>
                                            <h4 style="margin: 0 0 8px; font-size: 13px; font-weight: 800; color: #1B1B1B; font-family: 'Outfit', sans-serif;">Preguntas</h4>
                                            <p style="margin: 0; font-size: 11px; color: #7E7E7E; line-height: 1.4; font-family: 'Outfit', sans-serif;">Cuestionarios y reflexión a partir de cualquier texto.</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- CTA Section -->
                    <tr>
                        <td style="padding: 20px 40px 36px;">
                            <div style="background-color: #FBF9F6; border-radius: 24px; padding: 32px; text-align: center; border: 1px solid rgba(27,27,27,0.05);">
                                <p style="margin: 0 0 20px; font-size: 17px; font-weight: 700; color: #1B1B1B; font-family: 'Outfit', sans-serif;">
                                    ¿Listo para empezar?
                                </p>
                                <a href="${PLANIX_URL}/dashboard" 
                                   style="display: inline-block; background: ${primaryColor}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 36px; border-radius: 12px; font-family: 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0,70,171,0.15);">
                                    🚀 Ir a mi Dashboard
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Free Plan Info -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 16px 20px; text-align: center;">
                                <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 500; line-height: 1.5; font-family: 'Outfit', sans-serif;">
                                    🎁 Tu plan actual: <strong style="color: ${primaryColor};">Gratis</strong> — Incluye <strong>5 planificaciones mensuales</strong>. 
                                    <br>¿Necesitas más? <a href="${PLANIX_URL}/suscripcion" style="color: ${primaryColor}; font-weight: 700; text-decoration: underline;">Mejora tu plan hoy</a>
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 30px 40px; border-top: 1px solid #f1f5f9;">
                            <p style="margin: 0 0 10px; font-size: 13px; color: #7E7E7E; text-align: center; font-weight: 600; font-family: 'Outfit', sans-serif;">
                                ¿Tienes preguntas? Escríbenos a soporte@planix.do
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6; font-family: 'Outfit', sans-serif;">
                                Planix — Tu aliado en educación<br>
                                <a href="${PLANIX_URL}" style="color: ${primaryColor}; text-decoration: none; font-weight: 600;">www.planix.do</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

function getProWelcomeEmailTemplate(userName: string, formattedDate: string, daysRemaining: number): string {
  const primaryColor = '#0046ab';
  const bgColor = '#FBF9F6';
  const PLANIX_URL = 'https://planix.do';

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a Planix PRO!</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${bgColor};">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 10px 30px -5px rgba(27,27,27,0.08); border: 1px solid rgba(27,27,27,0.05);">
                    
                    <!-- Header with Logo on White Background -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background-color: #ffffff; border-bottom: 4px solid ${primaryColor};">
                            <div style="display: inline-block; padding: 10px 20px; background-color: #ffffff; border-radius: 12px; margin-bottom: 10px;">
                                <img src="https://planix.do/Logo-login-y-landing.webp" alt="Planix Logo" style="height: 70px; width: auto; display: block;">
                            </div>
                            <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: ${primaryColor}; letter-spacing: -0.5px; line-height: 1.1; font-family: 'Outfit', sans-serif;">
                                👑 ¡Tu acceso Pro está listo!
                            </h1>
                        </td>
                    </tr>

                    <!-- Main Message -->
                    <tr>
                        <td style="padding: 40px 48px 24px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 800; color: #1B1B1B; font-family: 'Outfit', sans-serif;">
                                Hola${userName ? `, ${userName}` : ''} 👋
                            </h2>
                            <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #7E7E7E; font-family: 'Outfit', sans-serif;">
                                <strong style="color: ${primaryColor};">¡Felicidades!</strong> Tu cuenta ha sido elevada al nivel <strong>Planix PRO</strong>. Ahora tienes acceso ilimitado a todas nuestras herramientas diseñadas para hacer tu labor docente más sencilla y efectiva.
                            </p>
                        </td>
                    </tr>

                    <!-- Subscription Details Box -->
                    <tr>
                        <td style="padding: 0 48px 32px;">
                            <div style="background-color: #f1f5f9; border-radius: 20px; padding: 24px; border: 1px solid rgba(27,27,27,0.05);">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                        <td>
                                            <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #7E7E7E; text-transform: uppercase; letter-spacing: 1px; font-family: 'Outfit', sans-serif;">Días de acceso Pro</p>
                                            <p style="margin: 0; font-size: 28px; font-weight: 900; color: ${primaryColor}; font-family: 'Outfit', sans-serif;">${daysRemaining} días</p>
                                        </td>
                                        <td align="right" style="text-align: right;">
                                            <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #7E7E7E; text-transform: uppercase; letter-spacing: 1px; font-family: 'Outfit', sans-serif;">Vence el</p>
                                            <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1B1B1B; font-family: 'Outfit', sans-serif;">${formattedDate}</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>

                    <!-- PRO Benefits Grid -->
                    <tr>
                        <td style="padding: 0 48px 20px;">
                            <h3 style="margin: 0 0 24px; font-size: 13px; font-weight: 800; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 2px; font-family: 'Outfit', sans-serif;">Beneficios Exclusivos</h3>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td width="50%" valign="top" style="padding-right: 15px; padding-bottom: 28px;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">🚀</div>
                                        <h4 style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #1B1B1B; font-family: 'Outfit', sans-serif;">Uso Ilimitado</h4>
                                        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #7E7E7E; font-family: 'Outfit', sans-serif;">Crea todas las planificaciones que necesites sin límites mensuales.</p>
                                    </td>
                                    <td width="50%" valign="top" style="padding-left: 15px; padding-bottom: 28px;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">🧠</div>
                                        <h4 style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #1B1B1B; font-family: 'Outfit', sans-serif;">IA Avanzada</h4>
                                        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #7E7E7E; font-family: 'Outfit', sans-serif;">Acceso a herramientas exclusivas de IA para rúbricas, exámenes y más.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="50%" valign="top" style="padding-right: 15px;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">🎨</div>
                                        <h4 style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #1B1B1B; font-family: 'Outfit', sans-serif;">Generador de Recursos</h4>
                                        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #7E7E7E; font-family: 'Outfit', sans-serif;">Crea materiales didácticos, sopas de letras y crucigramas en segundos.</p>
                                    </td>
                                    <td width="50%" valign="top" style="padding-left: 15px;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">👑</div>
                                        <h4 style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #1B1B1B; font-family: 'Outfit', sans-serif;">Soporte VIP</h4>
                                        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #7E7E7E; font-family: 'Outfit', sans-serif;">Atención prioritaria para cualquier consulta o ayuda técnica.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- CTA -->
                    <tr>
                        <td style="padding: 20px 48px 48px; text-align: center;">
                            <a href="${PLANIX_URL}/herramientas" 
                               style="display: inline-block; background: ${primaryColor}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 36px; border-radius: 12px; font-family: 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0,70,171,0.15);">
                                🚀 Explorar mis herramientas PRO
                             </a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 32px 48px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #7E7E7E; font-weight: 600; font-family: 'Outfit', sans-serif;">
                                Gracias por confiar en Planix para tu labor educativa.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; font-family: 'Outfit', sans-serif;">
                                Planix — Tu aliado en educación<br>
                                <a href="${PLANIX_URL}" style="color: ${primaryColor}; text-decoration: none;">www.planix.do</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

async function sendWelcomeEmail(email: string, name: string, apiKey: string) {
  const template = getWelcomeEmailTemplate(name);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Planix <no-responder@mail.planix.do>",
        to: [email],
        subject: "¡Bienvenido a Planix! Tu asistente de planificación docente",
        html: template,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Failed to send welcome email to ${email}:`, errText);
    } else {
      console.log(`Welcome email successfully sent to ${email}`);
    }
  } catch (err) {
    console.error(`Error sending welcome email to ${email}:`, err);
  }
}

async function sendProWelcomeEmail(email: string, name: string, expiryDate: string, apiKey: string) {
  const expiry = new Date(expiryDate);
  const formattedDate = expiry.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const diffTime = Math.max(0, expiry.getTime() - Date.now());
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const template = getProWelcomeEmailTemplate(name, formattedDate, daysRemaining);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Planix PRO <no-responder@mail.planix.do>",
        to: [email],
        subject: "¡Bienvenido a Planix PRO! Tu acceso ha sido activado",
        html: template,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Failed to send PRO welcome email to ${email}:`, errText);
    } else {
      console.log(`PRO welcome email successfully sent to ${email}`);
    }
  } catch (err) {
    console.error(`Error sending PRO welcome email to ${email}:`, err);
  }
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function verifyPolarSignature(payload: string, signature: string | null, secret: string | undefined): Promise<boolean> {
  if (!secret) return true; // Skip if secret is not set
  if (!signature) return false;
  
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify", "sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    );
    
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (signature === expectedSignature || signature.includes(expectedSignature)) {
      return true;
    }
  } catch (err) {
    console.error("Signature verification error:", err);
  }
  return false;
}
