const fs = require('fs');
const readline = require('readline');

async function run() {
  const logPath = 'C:\\Users\\Yeri Orlando\\.gemini\\antigravity-ide\\brain\\b782f2ea-f2db-4dd8-b861-24088ae232ac\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const step = JSON.parse(line);
    if (step.content && step.content.includes('AdminCurriculum.tsx') && step.content.includes('Showing lines')) {
      const lines = step.content.split('\n');
      const numberedLines = lines.filter(l => /^\d+:\s/.test(l));
      if (numberedLines.length > 0) {
        const firstLine = numberedLines[0];
        const lastLine = numberedLines[numberedLines.length - 1];
        console.log(`Step ${step.step_index}: content length = ${step.content.length}, numbered lines count = ${numberedLines.length}, range = [${firstLine.split(':')[0]} to ${lastLine.split(':')[0]}]`);
      }
    }
  }
}

run();
