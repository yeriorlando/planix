const fs = require('fs');
const path = require('path');

const files = [
  "c:/Users/Yeri Orlando/Desktop/Planix Nuevo/Planix Supabase/Planix1/src/pages/AdminUsuarios.tsx",
  "c:/Users/Yeri Orlando/Desktop/Planix Nuevo/Planix Claudflare/Planix/src/pages/AdminUsuarios.tsx"
];

for (const file of files) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    console.log(`--- File: ${file} ---`);
    console.log(`Length: ${content.length}`);
    const matches = [];
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes('colegio') || line.toLowerCase().includes('planix pro') || line.toLowerCase().includes('ultima_conexion') || line.toLowerCase().includes('last_login')) {
        matches.push(`${idx + 1}: ${line.trim()}`);
      }
    });
    console.log(`Found ${matches.length} matches:`);
    console.log(matches.slice(0, 20).join('\n'));
    if (matches.length > 20) console.log("... and more");
  } else {
    console.log(`File NOT found: ${file}`);
  }
}
