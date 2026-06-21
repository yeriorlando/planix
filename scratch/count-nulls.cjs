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
    .select('id, email, full_name, created_at, updated_at, nivel_principal, ciclo_principal, grado_principal');
    
  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }
  
  let total = profiles.length;
  let nullNivel = 0;
  let nullCiclo = 0;
  let nullGrado = 0;
  
  const nullExamples = [];
  
  profiles.forEach(p => {
    let isNull = false;
    if (p.nivel_principal === null || p.nivel_principal === undefined) {
      nullNivel++;
      isNull = true;
    }
    if (p.ciclo_principal === null || p.ciclo_principal === undefined) {
      nullCiclo++;
      isNull = true;
    }
    if (p.grado_principal === null || p.grado_principal === undefined) {
      nullGrado++;
      isNull = true;
    }
    
    if (isNull && nullExamples.length < 5) {
      nullExamples.push(p);
    }
  });
  
  console.log(`Total profiles: ${total}`);
  console.log(`Profiles with null nivel_principal: ${nullNivel} (${((nullNivel/total)*100).toFixed(1)}%)`);
  console.log(`Profiles with null ciclo_principal: ${nullCiclo} (${((nullCiclo/total)*100).toFixed(1)}%)`);
  console.log(`Profiles with null grado_principal: ${nullGrado} (${((nullGrado/total)*100).toFixed(1)}%)`);
  
  console.log("\nSome profiles with null academic fields:");
  console.log(JSON.stringify(nullExamples, null, 2));
}

run();
