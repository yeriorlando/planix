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
    
    // Check MODEL step tool calls
    if (step.tool_calls) {
      step.tool_calls.forEach(call => {
        if (call.name === 'view_file' && call.args.AbsolutePath && call.args.AbsolutePath.includes('AdminCurriculum.tsx')) {
          console.log(`Step ${lineCount} (MODEL call): StartLine=${call.args.StartLine}, EndLine=${call.args.EndLine}`);
        }
      });
    }

    // Check SYSTEM step content
    if (step.source === 'SYSTEM' && step.content && step.content.toLowerCase().includes('admincurriculum.tsx')) {
      console.log(`Step ${lineCount} (SYSTEM result): has "Showing lines", length=${step.content.length}`);
      const lines = step.content.split('\n');
      console.log(`  First line: ${lines[0]}`);
      console.log(`  Second line: ${lines[1]}`);
      console.log(`  Third line: ${lines[2]}`);
    }
  }
}
run();
