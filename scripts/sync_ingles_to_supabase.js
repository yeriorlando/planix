import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncEnglishUnits() {
  const jsonPath = 'C:/Users/Yeri Orlando/.gemini/antigravity-ide/brain/2e9ee442-3b1e-456e-acbc-972491e476a2/scratch/ingles_units_clean.json';
  const units = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`🚀 Sincronizando ${units.length} unidades de Inglés hacia Supabase (${supabaseUrl})...`);

  for (const unit of units) {
    const payload = {
      id: unit.id,
      subject_id: unit.subject_id,
      grade_id: unit.grade_id,
      content: typeof unit.content === 'object' ? JSON.stringify(unit.content) : unit.content,
      updated_at: unit.updated_at || new Date().toISOString()
    };

    const { data, error } = await supabase.from('custom_units').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error(`❌ Error en unidad ${unit.id} (${unit.grade_id}):`, error.message);
    } else {
      console.log(`✅ Unidad sincronizada exitosamente: ${unit.id} [${unit.grade_id}]`);
    }
  }

  console.log('\n🎉 Proceso de sincronización finalizado.');
}

syncEnglishUnits().catch(console.error);
