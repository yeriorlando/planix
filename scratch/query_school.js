import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://api.planix.do/';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .ilike('name', '%Hogar%Pituca%Flores%');

  if (error) {
    console.error('Error querying schools:', error);
  } else {
    console.log('Query results:', JSON.stringify(data, null, 2));
  }
}

run();
