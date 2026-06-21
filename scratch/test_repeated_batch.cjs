const https = require('https');

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
  console.log('Running batch test on DiceBear with repeated query parameters (hair=style1&hair=style2)...');
  const boyHairs = ["flatTop", "fluffy", "spiky", "shortCurls"];
  const queryStr = boyHairs.map(h => `hair=${h}`).join('&');

  let bunsCount = 0;
  const femaleSizes = {
    buns: 2660,
  };

  for (let i = 0; i < 50; i++) {
    const seed = `std_test_${i}_` + Math.random().toString(36).substring(2, 9);
    const url = `https://api.dicebear.com/9.x/dylan/svg?seed=${seed}&${queryStr}`;
    const svg = await fetchUrl(url);
    const size = svg.length;

    const isBuns = Math.abs(size - femaleSizes.buns) < 50;
    if (isBuns) bunsCount++;
  }

  console.log(`Finished 50 tests.`);
  console.log(`Buns count: ${bunsCount}`);
}

run().catch(console.error);
