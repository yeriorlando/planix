const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (file.endsWith('Unidad.tsx')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const formsDir = path.join(__dirname, '..', 'src', 'components', 'forms');
console.log('Searching in:', formsDir);
const files = walk(formsDir);
console.log(`Found ${files.length} Unidad.tsx files.`);

let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Target:
  // return `${idx > 0 ? '\n\n' : ''}${blockTitle}\n${content}`;
  // Replacement:
  // return `${idx > 0 ? '\n\n' : ''}${blockTitle}\n\n${content}`;
  
  const target = "return `${idx > 0 ? '\\n\\n' : ''}${blockTitle}\\n${content}`;";
  const replacement = "return `${idx > 0 ? '\\n\\n' : ''}${blockTitle}\\n\\n${content}`;";
  
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', path.basename(file));
    updatedCount++;
  } else {
    // Let's also check if it uses double double quotes or slightly different formatting
    const targetAlt = "return `${idx > 0 ? \"\\n\\n\" : \"\"}${blockTitle}\\n${content}`;";
    const replacementAlt = "return `${idx > 0 ? \"\\n\\n\" : \"\"}${blockTitle}\\n\\n${content}`;";
    if (content.includes(targetAlt)) {
      content = content.replace(targetAlt, replacementAlt);
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated (Alt):', path.basename(file));
      updatedCount++;
    } else {
      console.log('Target not found in:', path.basename(file));
    }
  }
});

console.log(`Successfully updated ${updatedCount} files.`);
