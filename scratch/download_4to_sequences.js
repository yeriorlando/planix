import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, supabaseKey);

const outputDir = path.resolve('src/components/forms/Primaria/Cuarto Grado/Lengua Española/Secuencias');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  console.log("Fetching all 4to Lengua Española sequences...");
  
  // 1. Fetch sequence headers
  const { data: sequences, error: seqErr } = await supabase
    .from('sequences')
    .select('*')
    .eq('grade_id', 'primaria-4to')
    .eq('subject_id', 'lengua-espanola-4to')
    .order('order', { ascending: true });
    
  if (seqErr) {
    console.error("Error fetching sequences:", seqErr);
    return;
  }
  
  console.log(`Found ${sequences.length} sequences.`);
  
  for (const seq of sequences) {
    console.log(`Fetching activities for sequence order ${seq.order}: ${seq.title}...`);
    
    const { data: activities, error: actErr } = await supabase
      .from('sequence_activities')
      .select('*')
      .eq('sequence_id', seq.id)
      .order('order_index', { ascending: true });
      
    if (actErr) {
      console.error(`Error fetching activities for sequence ${seq.id}:`, actErr);
      continue;
    }
    
    // Structure like what's expected by the form:
    // seq-1.json structure
    const formattedSeq = {
      id: seq.id,
      title: seq.title,
      description: seq.description || "",
      order: seq.order,
      durationWeeks: seq.duration_weeks || 4,
      activities: activities.map(act => ({
        id: act.id,
        sequence_id: act.sequence_id,
        order_index: act.order_index,
        title: act.title,
        name: act.name,
        intencion_pedagogica: act.intencion_pedagogica,
        estrategia: act.estrategia,
        aprendizaje_significativo: act.aprendizaje_significativo,
        actividades_complementarias: act.actividades_complementarias,
        actividades_cuaderno: act.actividades_cuaderno,
        inicio: act.inicio,
        desarrollo: act.desarrollo,
        cierre: act.cierre
      }))
    };
    
    // Save to a filename based on order and title slugified
    const slug = seq.title.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
      
    const filename = `seq-${seq.order}-${slug}.json`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(formattedSeq, null, 2));
    console.log(`Saved ${filepath}`);
  }
  
  console.log("All done!");
}

run();
