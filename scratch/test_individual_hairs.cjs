const fs = require('fs');
const https = require('https');
const path = require('path');

const styles = [
  "plain", "wavy", "shortCurls", "parting", "spiky", "roundBob",
  "longCurls", "buns", "bangs", "fluffy", "flatTop", "shaggy"
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', reject);
  });
}

async function run() {
  const seed = 'RubenDario';
  console.log('Fetching individual hair styles for seed:', seed);
  
  const sizes = {};
  for (const s of styles) {
    const url = `https://api.dicebear.com/9.x/dylan/svg?seed=${seed}&facialHairProbability=0&hair=${s}&backgroundColor=b6e3f4`;
    const svg = await fetchUrl(url);
    sizes[s] = svg.length;
    fs.writeFileSync(path.join(__dirname, `test_${s}.svg`), svg);
  }
  
  // Also fetch default (no hair parameter)
  const defaultSvg = await fetchUrl(`https://api.dicebear.com/9.x/dylan/svg?seed=${seed}&facialHairProbability=0&backgroundColor=b6e3f4`);
  console.log('\nResults (Size of SVG for each hair style):');
  console.log('default (no parameter):', defaultSvg.length);
  console.log(sizes);
}

run().catch(console.error);
