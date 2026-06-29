const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testUpsertFixed() {
  try {
    const { data, error } = await supabase
      .from("monthly_values")
      .upsert(
        {
          month: 6,
          value_name: "Test Value para Junio (Fixed)",
          updated_at: new Date().toISOString()
        },
        { onConflict: "month" }
      );
      
    if (error) {
      console.log("Upsert monthly_values failed:", error);
    } else {
      console.log("Upsert monthly_values successful using onConflict option!", data);
    }
  } catch (err) {
    console.error(err);
  }
}

testUpsertFixed();
