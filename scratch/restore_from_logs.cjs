const fs = require('fs');
const readline = require('readline');

async function run() {
  const logPath = 'C:\\Users\\Yeri Orlando\\.gemini\\antigravity-ide\\brain\\b782f2ea-f2db-4dd8-b861-24088ae232ac\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const parts = [];

  for await (const line of rl) {
    const step = JSON.parse(line);
    
    // In transcript.jsonl, the tool output step has:
    // source: "MODEL"
    // type: "VIEW_FILE"
    // status: "DONE"
    // content: contains the text output of the file
    if (step.type === 'VIEW_FILE' && step.content && 
        step.content.toLowerCase().includes('admincurriculum.tsx') && 
        step.content.includes('Showing lines')) {
      
      const match = step.content.match(/Showing lines (\d+) to (\d+)/i);
      if (match) {
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        console.log(`Found content for lines ${start} to ${end}`);
        
        const lines = step.content.split('\n');
        const contentLines = [];
        for (const l of lines) {
          const m = l.match(/^\d+:\s?(.*)$/);
          if (m) {
            contentLines.push(m[1]);
          }
        }
        
        const exists = parts.some(p => p.start === start && p.end === end);
        if (!exists) {
          parts.push({ start, end, content: contentLines.join('\n') });
        }
      }
    }
  }

  parts.sort((a, b) => a.start - b.start);

  if (parts.length > 0) {
    let finalCode = '';
    parts.forEach(p => {
      finalCode += p.content + '\n';
    });
    
    finalCode = finalCode.trimEnd() + '\n';
    
    const outputPath = 'c:\\Users\\Yeri Orlando\\Desktop\\Planix Nuevo\\Planix Claudflare\\Planix1\\src\\pages\\AdminCurriculum.tsx';
    fs.writeFileSync(outputPath, finalCode, 'utf8');
    console.log(`Successfully reconstructed and wrote pristine AdminCurriculum.tsx with ${finalCode.split('\n').length} lines.`);
  } else {
    console.log("No view_file outputs found in logs.");
  }
}

run();
