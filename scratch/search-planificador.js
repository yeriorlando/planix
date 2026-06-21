import fs from 'fs';

const content = fs.readFileSync('c:/Users/Yeri Orlando/Desktop/Planix Nuevo/Planix1/src/pages/Planificador.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('setCustomUnits')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
