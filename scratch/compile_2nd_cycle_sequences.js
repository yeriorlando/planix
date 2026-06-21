import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('src/lib/data/sequences/primaria');
const outputFilePath = path.join(baseDir, 'compiled_2nd_cycle_sequences.json');

function run() {
  console.log("Compiling all 2nd cycle sequences...");
  
  const compiled = {};
  const grades = ['4to', '5to', '6to'];
  const subjects = ['lengua', 'matematica'];
  
  grades.forEach(grade => {
    subjects.forEach(subj => {
      const dirPath = path.join(baseDir, grade, subj);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
          if (file.endsWith('.json')) {
            const filePath = path.join(dirPath, file);
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (content && content.id) {
              // Inject grade_id and subject_id fields
              content.grade_id = `primaria-${grade}`;
              content.subject_id = subj === 'lengua' ? `lengua-espanola-${grade}` : `matematica-${grade}`;
              compiled[content.id] = content;
            }
          }
        });
      }
    });
  });
  
  fs.writeFileSync(outputFilePath, JSON.stringify(compiled, null, 2));
  console.log(`Saved compiled sequences to ${outputFilePath}`);
}

run();

