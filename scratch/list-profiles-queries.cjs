const fs = require('fs');
const path = require('path');

const file = "c:/Users/Yeri Orlando/Desktop/Planix Nuevo/Planix Claudflare/Planix/src/worker/index.ts";
if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const matches = [];
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('from profiles') || line.toLowerCase().includes('update profiles') || line.toLowerCase().includes('insert into profiles')) {
      matches.push(`${idx + 1}: ${line.trim()}`);
    }
  });
  console.log(`Found ${matches.length} matches:`);
  console.log(matches.join('\n'));
} else {
  console.log("File not found");
}
