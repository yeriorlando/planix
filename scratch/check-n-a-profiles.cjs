const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://api.planix.do/";
const supabaseServiceKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, school_name, regional, distrito, municipio');

  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  let totalWithSchool = 0;
  let naRegional = 0;
  let naDistrito = 0;
  let naMunicipio = 0;
  const naExamples = [];

  profiles.forEach(p => {
    if (p.school_name && p.school_name.trim() !== '') {
      totalWithSchool++;
      let isNA = false;
      if (p.regional === 'N/A' || !p.regional) {
        naRegional++;
        isNA = true;
      }
      if (p.distrito === 'N/A' || !p.distrito) {
        naDistrito++;
        isNA = true;
      }
      if (p.municipio === 'N/A' || !p.municipio) {
        naMunicipio++;
        isNA = true;
      }
      if (isNA) {
        naExamples.push(p);
      }
    }
  });

  console.log(`Total profiles with school_name: ${totalWithSchool}`);
  console.log(`Profiles with N/A or empty regional: ${naRegional} (${((naRegional/totalWithSchool)*100).toFixed(1)}%)`);
  console.log(`Profiles with N/A or empty distrito: ${naDistrito} (${((naDistrito/totalWithSchool)*100).toFixed(1)}%)`);
  console.log(`Profiles with N/A or empty municipio: ${naMunicipio} (${((naMunicipio/totalWithSchool)*100).toFixed(1)}%)`);
  
  console.log("\nSome profiles with N/A fields:");
  console.log(JSON.stringify(naExamples.slice(0, 10), null, 2));
}

run();
