const fs = require('fs');
const readline = require('readline');

async function run() {
  const logPath = 'C:\\Users\\Yeri Orlando\\.gemini\\antigravity-ide\\brain\\b782f2ea-f2db-4dd8-b861-24088ae232ac\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    const step = JSON.parse(line);
    // Find step that contains view_file call for AdminCurriculum.tsx
    if (step.tool_calls) {
      const isView = step.tool_calls.some(call => call.name === 'view_file' && call.args.AbsolutePath && call.args.AbsolutePath.includes('AdminCurriculum.tsx'));
      if (isView) {
        console.log(`=== MODEL STEP ${lineCount} ===`);
        console.log(JSON.stringify(step, null, 2).slice(0, 1000));
        
        // Let's also read the next line (which should be the SYSTEM response containing the content)
        const nextLine = await getLineAt(logPath, lineCount + 1);
        if (nextLine) {
          console.log(`=== SYSTEM STEP ${lineCount + 1} ===`);
          const systemStep = JSON.parse(nextLine);
          console.log(JSON.stringify(systemStep, null, 2).slice(0, 1000));
        }
        break;
      }
    }
  }
}

async function getLineAt(path, index) {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  let count = 0;
  for await (const line of rl) {
    count++;
    if (count === index) {
      return line;
    }
  }
  return null;
}

run();
