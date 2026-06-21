import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching sequence seq-1771196358436...");
  
  // 1. Fetch sequence header
  const { data: seq, error: sErr } = await supabase
    .from('sequences')
    .select('*')
    .eq('id', 'seq-1771196358436')
    .single();
    
  if (sErr) {
    console.error("Error fetching sequence:", sErr);
    return;
  }
  
  console.log("Sequence title:", seq.title);
  console.log("Sequence columns:", Object.keys(seq));

  // 2. Fetch sequence activities
  const { data: activities, error: aErr } = await supabase
    .from('sequence_activities')
    .select('*')
    .eq('sequence_id', 'seq-1771196358436')
    .order('order_index', { ascending: true });
    
  if (aErr) {
    console.error("Error fetching activities:", aErr);
  } else {
    console.log(`Found ${activities.length} activities.`);
    seq.activities = activities;
  }
  
  fs.writeFileSync('scratch/seq-1771196358436.json', JSON.stringify(seq, null, 2));
  console.log("Saved sequence + activities to scratch/seq-1771196358436.json");
}

run();
