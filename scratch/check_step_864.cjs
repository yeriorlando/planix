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
    if (step.step_index === 864) {
      console.log("Step 864 content length:", step.content.length);
      console.log("First 300 chars of step 864:", step.content.substring(0, 300));
      console.log("Lines sample:");
      console.log(step.content.split('\n').slice(0, 10).join('\n'));
      break;
    }
  }
}

run();
