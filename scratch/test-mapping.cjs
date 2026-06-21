const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://api.planix.do/";
const supabaseServiceKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

function isPlanix2Format(content) {
  return !!(content && content.formData && typeof content.formData === 'object');
}

function mapPlanningFromDb(row) {
  const content = typeof row.content === 'string' ? JSON.parse(row.content) : (row.content || {});

  if (isPlanix2Format(content)) {
    const fd = content.formData;
    const momentosArr = fd.momentos || [];
    const inicio = momentosArr[0]?.descripcion || '';
    const desarrollo = momentosArr[1]?.descripcion || '';
    const cierre = momentosArr[2]?.descripcion || '';

    return {
      id: row.id,
      docente_id: row.user_id,
      titulo: fd.actividad_titulo || content.sequence || row.title || '',
      tipo: content.curriculum_type === 'CON_BASE' ? 'CON_BASE' : 'CURRICULAR',
      nivel: (fd.grado || '').toLowerCase().includes('secundaria') ? 'secundaria' 
           : (fd.grado || '').toLowerCase().includes('inicial') ? 'inicial' 
           : 'primaria',
      grado: fd.grado || '',
      asignatura: fd.area || content.subject || '',
      secuencia_id: content.sequence_id || '',
      bloque_id: '',
      actividad_id: fd.actividad_id || '',
      intencion_pedagogica: fd.intencion_pedagogica || '',
      recursos: Array.isArray(fd.recursos) ? fd.recursos : (fd.recursos ? [fd.recursos] : []),
      momentos: { inicio, desarrollo, cierre },
      tarea: fd.tarea_casa || fd.tarea_hogar || '',
      conceptual: '',
      procedimental: '',
      actitudinal: '',
      evaluacion: fd.evaluacion || '',
      creado_en: content.created_at || row.created_at || new Date().toISOString(),
      customFields: {
        ...fd,
        centro_educativo: fd.centro_educativo || '',
        seccion: fd.seccion || content.section || 'A',
        fecha: fd.fecha || content.date || '',
        bloque: fd.bloque || '',
        secuencia: content.sequence || '',
        estado: content.status || 'Borrador',
        momentos: momentosArr,
      },
      customFormSchema: null,
    };
  }

  return {
    id: row.id,
    docente_id: row.user_id || content.docente_id,
    titulo: row.title || content.titulo || '',
    tipo: content.tipo || 'CURRICULAR',
    nivel: content.nivel || 'primaria',
    grado: content.grado || '',
    asignatura: content.asignatura || '',
    secuencia_id: content.secuencia_id || '',
    bloque_id: content.bloque_id || '',
    actividad_id: content.actividad_id || '',
    intencion_pedagogica: content.intencion_pedagogica || '',
    recursos: content.recursos || [],
    momentos: content.momentos || { inicio: '', desarrollo: '', cierre: '' },
    tarea: content.tarea || '',
    conceptual: content.conceptual || '',
    procedimental: content.procedimental || '',
    actitudinal: content.actitudinal || '',
    evaluacion: content.evaluacion || '',
    creado_en: row.created_at || content.creado_en || new Date().toISOString(),
    customFields: content.customFields || {},
    customFormSchema: content.customFormSchema || null,
  };
}

async function run() {
  console.log("Fetching all plannings from Supabase to test mapping...");
  
  const { data: rows, error } = await supabase.from('plannings').select('*');
  if (error) {
    console.error("Error fetching plannings:", error);
    return;
  }
  
  console.log(`Fetched ${rows.length} rows. Testing mapping...`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const row of rows) {
    try {
      const mapped = mapPlanningFromDb(row);
      successCount++;
    } catch (e) {
      failCount++;
      console.error(`\n[Mapping Failure] Planning ID: ${row.id}, user_id: ${row.user_id}`);
      console.error(`Error message: ${e.message}`);
      console.error("Row content:", JSON.stringify(row, null, 2));
    }
  }
  
  console.log(`\nMapping results: ${successCount} succeeded, ${failCount} failed.`);
}

run();
