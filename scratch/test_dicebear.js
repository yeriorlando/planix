const fs = require('fs');
const https = require('https');
const path = require('path');

function fetchUrl(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        fs.writeFileSync(path.join(__dirname, filename), data);
        console.log(`Saved ${filename} (size: ${data.length})`);
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function run() {
  const seed = 'RubenDario';
  
  // 1. Comma separated (what we are currently doing)
  await fetchUrl(
    `https://api.dicebear.com/9.x/dylan/svg?seed=${seed}&facialHairProbability=0&hair=flatTop,fluffy,spiky,shortCurls&backgroundColor=b6e3f4`,
    'test_comma.svg'
  );

  // 2. Bracket notation
  await fetchUrl(
    `https://api.dicebear.com/9.x/dylan/svg?seed=${seed}&facialHairProbability=0&hair[]=flatTop&hair[]=fluffy&hair[]=spiky&hair[]=shortCurls&backgroundColor=b6e3f4`,
    'test_brackets.svg'
  );

  // 3. Repeating parameter
  await fetchUrl(
    `https://api.dicebear.com/9.x/dylan/svg?seed=${seed}&facialHairProbability=0&hair=flatTop&hair=fluffy&hair=spiky&hair=shortCurls&backgroundColor=b6e3f4`,
    'test_repeated.svg'
  );

  // 4. No hair constraint (random/default)
  await fetchUrl(
    `https://api.dicebear.com/9.x/dylan/svg?seed=${seed}&facialHairProbability=0&backgroundColor=b6e3f4`,
    'test_default.svg'
  );

  // 5. Single style (forcing flatTop)
  await fetchUrl(
    `https://api.dicebear.com/9.x/dylan/svg?seed=${seed}&facialHairProbability=0&hair=flatTop&backgroundColor=b6e3f4`,
    'test_single.svg'
  );

  // Let's compare contents
  const comma = fs.readFileSync(path.join(__dirname, 'test_comma.svg'), 'utf8');
  const brackets = fs.readFileSync(path.join(__dirname, 'test_brackets.svg'), 'utf8');
  const repeated = fs.readFileSync(path.join(__dirname, 'test_repeated.svg'), 'utf8');
  const def = fs.readFileSync(path.join(__dirname, 'test_default.svg'), 'utf8');
  const single = fs.readFileSync(path.join(__dirname, 'test_single.svg'), 'utf8');

  console.log('\n--- Comparison ---');
  console.log('Is comma same as default?', comma === def);
  console.log('Is brackets same as default?', brackets === def);
  console.log('Is repeated same as default?', repeated === def);
  console.log('Is single same as default?', single === def);
  console.log('Is comma same as single?', comma === single);
}

run().catch(console.error);
