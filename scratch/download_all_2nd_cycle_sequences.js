import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, supabaseKey);

const baseDir = path.resolve('src/lib/data/sequences/primaria');

async function run() {
  console.log("Fetching sequence headers for 2nd cycle (4to, 5to, 6to)...");
  
  const { data: sequences, error: seqErr } = await supabase
    .from('sequences')
    .select('*')
    .in('grade_id', ['primaria-4to', 'primaria-5to', 'primaria-6to'])
    .order('grade_id')
    .order('order');
    
  if (seqErr) {
    console.error("Error fetching sequences:", seqErr);
    return;
  }
  
  console.log(`Found ${sequences.length} sequences to download.`);
  
  for (const seq of sequences) {
    // Determine target folder based on grade and subject
    const gradeShort = seq.grade_id.split('-')[1]; // '4to', '5to', '6to'
    
    // Normalize subject subfolder
    let subjectSubfolder = 'lengua';
    if (seq.subject_id.includes('matematica')) {
      subjectSubfolder = 'matematica';
    }
    
    const targetDir = path.join(baseDir, gradeShort, subjectSubfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    console.log(`[${seq.grade_id}][${subjectSubfolder}] Fetching activities for: ${seq.title}...`);
    
    const { data: activities, error: actErr } = await supabase
      .from('sequence_activities')
      .select('*')
      .eq('sequence_id', seq.id)
      .order('order_index', { ascending: true });
      
    if (actErr) {
      console.error(`Error fetching activities for sequence ${seq.id}:`, actErr);
      continue;
    }
    
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
    
    const slug = seq.title.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
      
    const filename = `seq-${seq.order}-${slug}.json`;
    const filepath = path.join(targetDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(formattedSeq, null, 2));
    console.log(`Saved ${filepath}`);
  }
  
  console.log("All sequences downloaded successfully!");
}

run();
