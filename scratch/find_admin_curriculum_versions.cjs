const fs = require('fs');
const readline = require('readline');

async function run() {
  const logPath = 'C:\\Users\\Yeri Orlando\\.gemini\\antigravity-ide\\brain\\b782f2ea-f2db-4dd8-b861-24088ae232ac\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let index = 0;
  for await (const line of rl) {
    const step = JSON.parse(line);
    const text = JSON.stringify(step);
    if (text.includes('AdminCurriculum.tsx') && text.includes('Showing lines')) {
      const match = text.match(/Showing lines (\d+) to (\d+)/i);
      console.log(`Step ${step.step_index || index}: type=${step.type}, source=${step.source}, range=${match ? match[1] + '-' + match[2] : 'unknown'}`);
    }
    index++;
  }
}

run();
