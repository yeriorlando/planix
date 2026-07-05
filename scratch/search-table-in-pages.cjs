const fs = require('fs');
const path = require('path');

const pagesDir = "c:/Users/Yeri Orlando/Desktop/Planix Nuevo/Planix Supabase/Planix1/src/pages";

function searchDir(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.toLowerCase().includes('rol / plan') || content.toLowerCase().includes('estado / actividad') || content.toLowerCase().includes('última conexión') || content.toLowerCase().includes('centro educativo')) {
        console.log(`Found match in file: ${filePath}`);
        // print matching lines
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.toLowerCase().includes('rol') || line.toLowerCase().includes('plan') || line.toLowerCase().includes('última') || line.toLowerCase().includes('actividad') || line.toLowerCase().includes('usuario')) {
            console.log(`  L${idx+1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchDir(pagesDir);
