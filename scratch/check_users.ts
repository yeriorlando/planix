import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function checkUsers() {
  console.log("Fetching users from Supabase Auth...");
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error("Error listing users:", error);
    return;
  }
  
  console.log(`Found ${data.users.length} users:`);
  for (const u of data.users) {
    console.log(`- ID: ${u.id} | Email: ${u.email} | Created At: ${u.created_at}`);
  }
}

checkUsers();
