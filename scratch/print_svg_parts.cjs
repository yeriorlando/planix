const fs = require('fs');
const path = require('path');

function printSvgGroups(filename) {
  const content = fs.readFileSync(path.join(__dirname, filename), 'utf8');
  console.log(`\n=== SVG Structure of ${filename} ===`);
  
  // Find all <g> tags or specific elements
  const matches = content.match(/<g[^>]*>|<path[^>]*id="[^"]+"[^>]*>/g) || [];
  console.log('Matches:', matches.slice(0, 15));
}

printSvgGroups('test_comma.svg');
printSvgGroups('test_default.svg');
printSvgGroups('test_single.svg');
