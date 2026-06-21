import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching configurations from Supabase...');
  const { data, error } = await supabase
    .from('site_configs')
    .select('*');

  if (error) {
    console.error('Error fetching site_configs:', error);
    process.exit(1);
  }

  console.log(`Found ${data.length} site configs in Supabase.`);

  if (data.length === 0) {
    console.log('No configurations to migrate.');
    return;
  }

  let sqlStatements = '';
  for (const row of data) {
    const key = row.key;
    const valueString = JSON.stringify(row.value).replace(/'/g, "''"); // Escape single quotes for SQL
    const updatedAt = row.updated_at || new Date().toISOString();

    sqlStatements += `INSERT INTO site_configs (key, value, updated_at) VALUES ('${key}', '${valueString}', '${updatedAt}') ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at; `;
  }

  console.log('SQL generated. Saving to temporary file and applying to Cloudflare D1 (planix-db)...');
  try {
    const fs = await import('fs');
    const sqlFilePath = path.resolve(__dirname, 'temp_config_migration.sql');
    fs.writeFileSync(sqlFilePath, sqlStatements, 'utf-8');

    const command = `npx wrangler d1 execute planix-db --remote --file=scratch/temp_config_migration.sql`;
    const output = execSync(command, { encoding: 'utf-8' });
    console.log('Wrangler command output:');
    console.log(output);

    // Clean up temporary file
    fs.unlinkSync(sqlFilePath);
    console.log('Migration completed successfully!');
  } catch (cmdErr) {
    console.error('Failed to run wrangler d1 command:', cmdErr);
  }
}

run();
