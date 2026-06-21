const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:\\Users\\Yeri Orlando\\Desktop\\Planix Nuevo\\Planix Claudflare\\Planix1\\src\\lib\\data\\sequences\\primaria\\compiled_2nd_cycle_sequences.json', 'utf8'));

const keys = Object.keys(data);
console.log(`Total sequences: ${keys.length}`);
console.log("First 3 sequence IDs:", keys.slice(0, 3));

if (keys.length > 0) {
  const first = data[keys[0]];
  console.log("Keys in first sequence object:", Object.keys(first));
  console.log("grade_id:", first.grade_id);
  console.log("subject_id:", first.subject_id);
  console.log("title:", first.title);
  console.log("activities count:", first.activities ? first.activities.length : 0);
  if (first.activities && first.activities.length > 0) {
    const act = first.activities[0];
    console.log("First activity keys:", Object.keys(act));
    console.log("First activity moments:", act.moments);
  }
}
