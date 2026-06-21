const fs = require('fs');
const readline = require('readline');

async function run() {
  const logPath = 'C:\\Users\\Yeri Orlando\\.gemini\\antigravity-ide\\brain\\b782f2ea-f2db-4dd8-b861-24088ae232ac\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const parts = {};

  for await (const line of rl) {
    const step = JSON.parse(line);
    if (step.content && step.content.includes('AdminCurriculum.tsx')) {
      let range = null;
      if (step.content.includes('Showing lines 1 to 800')) range = '1-800';
      else if (step.content.includes('Showing lines 801 to 1600')) range = '801-1600';
      else if (step.content.includes('Showing lines 1601 to 2400')) range = '1601-2400';
      else if (step.content.includes('Showing lines 2401 to 2784')) range = '2401-2784';

      if (range) {
        console.log(`Found chunk ${range} in step index ${step.step_index}`);
        const lines = step.content.split('\n');
        const contentLines = [];
        for (const l of lines) {
          const m = l.match(/^\d+:\s?(.*)$/);
          if (m) {
            contentLines.push(m[1]);
          }
        }
        parts[range] = contentLines.join('\n');
      }
    }
  }

  const expectedRanges = ['1-800', '801-1600', '1601-2400', '2401-2784'];
  const missing = expectedRanges.filter(r => !parts[r]);
  if (missing.length > 0) {
    console.error(`ERROR: Missing chunks: ${missing.join(', ')}`);
    return;
  }

  const finalCode = expectedRanges.map(r => parts[r]).join('\n') + '\n';
  
  const outputPath = 'c:\\Users\\Yeri Orlando\\Desktop\\Planix Nuevo\\Planix Claudflare\\Planix1\\src\\pages\\AdminCurriculum.tsx';
  fs.writeFileSync(outputPath, finalCode, 'utf8');
  console.log(`SUCCESS: Wrote ${finalCode.split('\n').length} lines to ${outputPath}`);
}

run();
