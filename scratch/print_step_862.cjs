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
    if (step.step_index === 862) {
      console.log("Keys of step 862:", Object.keys(step));
      console.log("type:", step.type);
      console.log("source:", step.source);
      console.log("status:", step.status);
      console.log("content snippet:", step.content ? step.content.substring(0, 300) : "no content");
      if (step.tool_calls) {
        console.log("tool_calls:", JSON.stringify(step.tool_calls).substring(0, 300));
      }
      break;
    }
  }
}

run();
