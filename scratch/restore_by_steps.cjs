const fs = require('fs');
const readline = require('readline');

async function run() {
  const logPath = 'C:\\Users\\Yeri Orlando\\.gemini\\antigravity-ide\\brain\\b782f2ea-f2db-4dd8-b861-24088ae232ac\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const targets = {
    862: '1-800',
    864: '801-1600',
    866: '1601-2400',
    868: '2401-2784'
  };

  const parts = {};

  for await (const line of rl) {
    const step = JSON.parse(line);
    if (targets[step.step_index]) {
      const range = targets[step.step_index];
      console.log(`Extracting range ${range} from step ${step.step_index}`);
      
      const lines = step.content.split('\n');
      const contentLines = [];
      for (const l of lines) {
        // Match lines prefixed by line numbers like "123: content"
        const m = l.match(/^\d+:\s?(.*)$/);
        if (m) {
          contentLines.push(m[1]);
        }
      }
      parts[range] = contentLines.join('\n');
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
