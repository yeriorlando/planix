import fs from 'fs';
import path from 'path';

// Configure API base URL (fall back to localhost if not specified in env)
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8787';

const PATH_MAP = {
  'seq-1-lengua-1ro': 'src/lib/data/sequences/primaria/1ro/lengua/seq-1-lengua-1ro.json',
  'seq-2-lengua-1ro': 'src/lib/data/sequences/primaria/1ro/lengua/seq-2-lengua-1ro.json',
  'seq-3-lengua-1ro': 'src/lib/data/sequences/primaria/1ro/lengua/seq-3-lengua-1ro.json',
  'seq-4-lengua-1ro': 'src/lib/data/sequences/primaria/1ro/lengua/seq-4-lengua-1ro.json',
  'seq-5-lengua-1ro': 'src/lib/data/sequences/primaria/1ro/lengua/seq-5-lengua-1ro.json',
  'seq-6-lengua-1ro': 'src/lib/data/sequences/primaria/1ro/lengua/seq-6-lengua-1ro.json',
};

async function syncSequences() {
  console.log(`📡 Conectando a ${API_BASE_URL} para descargar secuencias personalizadas...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/custom-sequences`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    const customSequences = await response.json();
    if (!Array.isArray(customSequences)) {
      throw new Error('Respuesta inválida de la API.');
    }

    console.log(`✅ Se obtuvieron ${customSequences.length} secuencias de la base de datos D1.`);

    let syncCount = 0;
    for (const seq of customSequences) {
      const relativePath = PATH_MAP[seq.id];
      if (!relativePath) {
        console.warn(`⚠️ Secuencia ID "${seq.id}" no tiene un mapeo de ruta local configurado. Se omitió.`);
        continue;
      }

      const absolutePath = path.resolve(process.cwd(), relativePath);
      
      // Content could be parsed or raw string
      const contentObj = typeof seq.content === 'string' ? JSON.parse(seq.content) : seq.content;
      const formattedJson = JSON.stringify(contentObj, null, 2);

      // Write to file
      fs.writeFileSync(absolutePath, formattedJson, 'utf-8');
      console.log(`   📝 Sincronizada localmente: ${relativePath}`);
      syncCount++;
    }

    console.log(`\n🎉 Sincronización completada con éxito. Se actualizaron ${syncCount} archivos locales.`);
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message);
    process.exit(1);
  }
}

syncSequences();
