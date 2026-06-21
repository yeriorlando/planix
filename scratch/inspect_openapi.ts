import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function getOpenAPI() {
  const url = `${supabaseUrl}/rest/v1/`;
  const response = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  const schema: any = await response.json();
  console.log("Tables available:");
  console.log(Object.keys(schema.paths));

  console.log("\nDetails for /attendance:");
  console.log(JSON.stringify(schema.definitions?.attendance, null, 2));
}

getOpenAPI().catch(console.error);
