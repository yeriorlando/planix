const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/lib/data/sequences/primaria/compiled_2nd_cycle_sequences.json');
if (!fs.existsSync(filePath)) {
  console.log("File does not exist:", filePath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const counts = {};

for (const id in data) {
  const seq = data[id];
  const key = `${seq.grade_id} | ${seq.subject_id}`;
  counts[key] = (counts[key] || 0) + 1;
}

console.log("Compiled sequences summary:");
console.log(JSON.stringify(counts, null, 2));
