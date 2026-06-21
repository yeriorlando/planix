const fs = require('fs');
const path = require('path');

const styles = [
  "plain", "wavy", "shortCurls", "parting", "spiky", "roundBob",
  "longCurls", "buns", "bangs", "fluffy", "flatTop", "shaggy"
];

function inspectFile(filename) {
  const content = fs.readFileSync(path.join(__dirname, filename), 'utf8');
  console.log(`\n--- Inspecting ${filename} ---`);
  
  // Look for any of the hair style names in the SVG content
  // Since DiceBear compiles paths, the id or comments might contain the name.
  // Let's print out what we find or some snippets of paths
  const found = [];
  for (const s of styles) {
    if (content.includes(s)) {
      found.push(s);
    }
  }
  console.log('Matches found in file:', found);
}

inspectFile('test_comma.svg');
inspectFile('test_brackets.svg');
inspectFile('test_repeated.svg');
inspectFile('test_default.svg');
inspectFile('test_single.svg');
