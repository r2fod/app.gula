
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manual env parsing
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Reading .env from: ${envPath}`);

let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split(/\r?\n/).forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      // Remove quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }

      if (key === 'VITE_SUPABASE_URL') supabaseUrl = val;
      if (key === 'VITE_SUPABASE_ANON_KEY') supabaseKey = val;
      if (key === 'VITE_SUPABASE_PUBLISHABLE_KEY' && !supabaseKey) supabaseKey = val;
    }
  });
}

if (!supabaseUrl || !supabaseKey) {
  console.error("FAIL: Missing Supabase credentials.");
  console.log(`URL found: ${!!supabaseUrl}`);
  console.log(`Key found: ${!!supabaseKey}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn() {
  console.log(`Connecting to: ${supabaseUrl}`);

  const { data, error } = await supabase
    .from('beverages')
    .select('photo_url')
    .limit(1);

  if (error) {
    console.error("Error selecting photo_url:", error.message);
    // 42703 is the Postgres code for "undefined_column"
    if (error.code === '42703' || error.message.includes('does not exist') || error.message.includes('column "photo_url"')) {
      console.log("\n!!! CONCLUSION: The 'photo_url' column DOES NOT EXIST. Migration needed. !!!");
      console.log("ACTION: Run 'supabase db push' in your terminal.\n");
    } else {
      console.log("CONCLUSION: Unknown error accessing DB:", error);
    }
  } else {
    console.log("Success! 'photo_url' column exists.");
  }
}

checkColumn();
