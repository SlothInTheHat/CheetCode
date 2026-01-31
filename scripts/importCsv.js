#!/usr/bin/env node
import fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const [, , csvPath, tableName] = process.argv;
  if (!csvPath || !tableName) {
    console.error('Usage: node scripts/importCsv.js <path/to/file.csv> <table_name>');
    process.exit(1);
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const text = await fs.readFile(csvPath, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    console.error('CSV file is empty');
    process.exit(1);
  }

  const headers = parseCsvLine(lines.shift());

  const rows = lines.map((line) => {
    const values = parseCsvLine(line);
    const obj = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = values[i] ?? null;
    }
    return obj;
  });

  const batchSize = 500;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(tableName).insert(batch);
    if (error) {
      console.error('Insert error:', error);
      process.exit(1);
    }
    console.log(`Inserted ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
  }

  console.log('CSV import complete');
}

// Very small CSV parser that handles quoted fields with commas and simple escapes.
function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  result.push(cur);
  return result.map((s) => (s === '' ? null : s));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
