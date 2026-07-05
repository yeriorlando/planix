const fs = require('fs');
const path = require('path');

const dirs = [
  "c:/Users/Yeri Orlando/Desktop/Planix Nuevo/Planix Supabase/Planix1/src",
  "c:/Users/Yeri Orlando/Desktop/Planix Nuevo/Planix Claudflare/Planix/src"
];

function searchDir(dir, searchTerms) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchDir(filePath, searchTerms);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        let matchCount = 0;
        for (const term of searchTerms) {
          if (line.toLowerCase().includes(term.toLowerCase())) {
            matchCount++;
          }
        }
        if (matchCount >= 2) {
          console.log(`${filePath}:${idx+1} -> ${line.trim()}`);
        }
      });
    }
  }
}

console.log("Searching for lines containing at least 2 headers...");
searchDir(dirs[0], ["usuario", "colegio", "rol", "plan", "conexión", "actividad"]);
searchDir(dirs[1], ["usuario", "colegio", "rol", "plan", "conexión", "actividad"]);
