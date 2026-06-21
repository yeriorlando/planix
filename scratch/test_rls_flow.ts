import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

// Helper to generate a valid UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function runTest() {
  const email = `test_teacher_${Math.random().toString(36).slice(2, 9)}@example.com`;
  const password = "password123";

  console.log(`Creating auth user: ${email}...`);
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Test Teacher" }
  });

  if (createError) {
    console.error("Admin user creation failed:", createError);
    return;
  }

  const userId = userData.user.id;
  console.log(`User created successfully with ID: ${userId}`);

  // Create a profile for this user as well (bypassing RLS since we use admin client)
  console.log("Creating profile row for the user...");
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: userId,
      full_name: "Test Teacher",
      email: email,
      role: "teacher"
    });

  if (profileError) {
    console.error("Profile creation failed:", profileError);
    return;
  }

  // Log in as the user on the anon client
  console.log("Signing in on the anon client...");
  const { data: sessionData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error("Sign in failed:", signInError);
    return;
  }

  console.log("Successfully signed in. Token:", sessionData.session?.access_token.slice(0, 20) + "...");

  // Try inserting a planning
  const uuid = generateUUID();
  console.log(`Inserting planning row with ID ${uuid} for user ${userId} using signed-in client...`);

  const dbRow = {
    id: uuid,
    user_id: userId,
    title: "Test Planning Auth",
    type: "CURRICULAR",
    subject_id: null,
    grade_id: null,
    status: 'Borrador',
    content: {
      id: uuid,
      docente_id: userId,
      titulo: "Test Planning Auth",
      tipo: "CURRICULAR",
      nivel: "primaria",
      grado: "1ro",
      asignatura: "Lengua Española"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: false
  };

  const { data: insertData, error: insertError } = await supabaseAnon
    .from("plannings")
    .insert(dbRow)
    .select();

  if (insertError) {
    console.error("Planning insert failed with error:", insertError);
  } else {
    console.log("Planning insert SUCCEEDED!", insertData);
  }

  // Cleanup
  console.log("Cleaning up test user...");
  await supabaseAdmin.auth.admin.deleteUser(userId);
}

runTest();
