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
    const text = JSON.stringify(step);
    if (text.includes('AdminCurriculum.tsx') && text.includes('AVAILABLE_GRADES')) {
      console.log(`Step ${step.step_index}: type=${step.type}, source=${step.source}`);
      if (step.content) {
        const lines = step.content.split('\n');
        const matching = lines.filter(l => l.includes('AVAILABLE_GRADES'));
        matching.forEach(m => console.log(`  -> ${m}`));
      }
      if (step.tool_calls) {
        step.tool_calls.forEach(call => {
          if (JSON.stringify(call).includes('AVAILABLE_GRADES')) {
            console.log(`  Tool Call ${call.name}: args=${JSON.stringify(call.args).substring(0, 300)}`);
          }
        });
      }
    }
  }
}

run();
