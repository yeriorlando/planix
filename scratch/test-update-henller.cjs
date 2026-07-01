const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://api.planix.do/";
const supabaseServiceKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  const userId = "1642810b-ce26-4f0c-af2b-5f1df2c35eaa"; // Henller Severino
  console.log("Fetching old profile...");
  const { data: oldProfile, error: getError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (getError) {
    console.error("Error getting profile:", getError);
    return;
  }

  console.log("Old profile:", {
    id: oldProfile.id,
    full_name: oldProfile.full_name,
    is_ambassador: oldProfile.is_ambassador,
    preferences: oldProfile.preferences
  });

  // Now, simulate what the POST /api/profiles route does:
  const body = {
    id: userId,
    preferences: JSON.stringify({
      has_seen_ambassador_celebration: true
    })
  };

  const referralCode = oldProfile.referral_code;
  const referredBy = oldProfile.referred_by;
  const finalCredits = oldProfile.credits;
  const schoolNameVal = oldProfile.school_name;
  const regionalVal = oldProfile.regional;
  const distritoVal = oldProfile.distrito;
  const municipioVal = oldProfile.municipio;

  const profileData = {
    id: body.id,
    full_name: body.full_name !== undefined ? body.full_name : (body.nombre !== undefined ? body.nombre : (oldProfile.full_name || "")),
    email: body.email !== undefined ? body.email : (oldProfile.email || ""),
    role: body.role !== undefined ? body.role : (body.rol !== undefined ? body.rol : (oldProfile.role || "teacher")),
    subscription_tier: body.subscription_tier !== undefined ? body.subscription_tier : (body.suscripcion !== undefined ? body.suscripcion : (oldProfile.subscription_tier || "free")),
    subscription_status: body.subscription_status !== undefined ? body.subscription_status : (body.estado_suscripcion !== undefined ? body.estado_suscripcion : (oldProfile.subscription_status || "ACTIVO")),
    subscription_expiry: body.subscription_expiry !== undefined ? body.subscription_expiry : (body.suscripcion_hasta !== undefined ? body.suscripcion_hasta : (oldProfile.subscription_expiry || null)),
    school_name: schoolNameVal,
    nivel_principal: body.nivel_principal !== undefined ? body.nivel_principal : (body.nivel !== undefined ? body.nivel : (oldProfile.nivel_principal || null)),
    ciclo_principal: body.ciclo_principal !== undefined ? body.ciclo_principal : (body.ciclo !== undefined ? body.ciclo : (oldProfile.ciclo_principal || null)),
    grado_principal: body.grado_principal !== undefined ? body.grado_principal : (body.grado !== undefined ? body.grado : (oldProfile.grado_principal || null)),
    allowed_subjects: body.allowed_subjects !== undefined ? body.allowed_subjects : (oldProfile.allowed_subjects || null),
    last_login: body.last_login !== undefined ? body.last_login : (oldProfile.last_login || new Date().toISOString()),
    is_active: body.is_active !== undefined ? (body.is_active ? true : false) : (oldProfile.is_active !== undefined ? oldProfile.is_active : true),
    regional: regionalVal,
    distrito: distritoVal,
    municipio: municipioVal,
    avatar_url: body.avatar_url !== undefined ? body.avatar_url : (oldProfile.avatar_url || null),
    credits: finalCredits,
    referral_code: referralCode,
    referred_by: referredBy,
    updated_at: new Date().toISOString(),

    // Preserving other database columns to avoid overwriting them to null during upsert
    year_escolar_activo: body.year_escolar_activo !== undefined ? body.year_escolar_activo : (oldProfile.year_escolar_activo || null),
    preferences: body.preferences !== undefined ? (() => {
        if (typeof body.preferences === "string") {
          try { return JSON.parse(body.preferences); } catch (_) { return body.preferences; }
        }
        return body.preferences;
      })() : (oldProfile.preferences || null),
    phone: body.phone !== undefined ? body.phone : (oldProfile.phone || null),
    provincia: body.provincia !== undefined ? body.provincia : (oldProfile.provincia || null),
    codigo_centro: body.codigo_centro !== undefined ? body.codigo_centro : (oldProfile.codigo_centro || null),
    community_bio: body.community_bio !== undefined ? body.community_bio : (oldProfile.community_bio || null),
    polar_customer_id: body.polar_customer_id !== undefined ? body.polar_customer_id : (oldProfile.polar_customer_id || null),
    is_ambassador: body.is_ambassador !== undefined ? (body.is_ambassador ? true : false) : (oldProfile.is_ambassador !== undefined ? oldProfile.is_ambassador : false),
    current_plan_id: body.current_plan_id !== undefined ? body.current_plan_id : (oldProfile.current_plan_id || null),
    asignaturas: body.asignaturas !== undefined ? body.asignaturas : (oldProfile.asignaturas || null),
    jornada: body.jornada !== undefined ? body.jornada : (oldProfile.jornada || null),
    fingerprint: body.fingerprint !== undefined ? body.fingerprint : (oldProfile.fingerprint || null)
  };

  console.log("Upserting with profileData:", {
    id: profileData.id,
    preferences: profileData.preferences
  });

  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert(profileData);

  if (upsertError) {
    console.error("Upsert failed:", upsertError);
    return;
  }

  console.log("Upsert succeeded! Re-fetching profile...");
  const { data: updatedProfile, error: getError2 } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (getError2) {
    console.error("Error re-fetching profile:", getError2);
    return;
  }

  console.log("Updated profile from DB:", {
    id: updatedProfile.id,
    full_name: updatedProfile.full_name,
    is_ambassador: updatedProfile.is_ambassador,
    preferences: updatedProfile.preferences
  });
}

run();
