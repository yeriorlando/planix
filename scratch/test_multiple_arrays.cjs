const fs = require('fs');
const https = require('https');
const path = require('path');

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
  const url = 'https://api.dicebear.com/9.x/dylan/svg?seed=RubenDario&facialHairProbability=0&hair=flatTop,fluffy,spiky,shortCurls&backgroundColor=b6e3f4,c0d6df,c1f0c1,d8f3dc,d8e2dc&hairColor=000000,362819,4a3728,6b503c,a57c5b&mood=happy,superHappy,neutral';
  
  const svg = await fetchUrl(url);
  console.log('SVG size with all parameters:', svg.length);
  
  // Let's check if the SVG size matches any of the known hair style sizes
  // Plain: 2280, wavy: 2351, shortCurls: 2824, parting: 2260, spiky: 2350,
  // roundBob: 2281, longCurls: 3532, buns: 2660, bangs: 2262, fluffy: 2444,
  // flatTop: 2289, shaggy: 3225
  
  // Note: the size might vary slightly because hairColor changes path colors or background color changes
  // Let's write the SVG to a file so we can analyze it
  fs.writeFileSync(path.join(__dirname, 'test_all_params.svg'), svg);
}

run().catch(console.error);
