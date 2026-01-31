#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const KEYWORDS_AI_KEY = process.env.VITE_KEYWORDS_AI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !KEYWORDS_AI_KEY) {
  console.error('Missing environment variables:');
  console.error('  VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('  VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓' : '✗');
  console.error('  VITE_KEYWORDS_AI_API_KEY:', KEYWORDS_AI_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const generateStarterCodePrompt = (title, description) => `You are a Python coding instructor. Generate a Python starter code template for this LeetCode problem.

**Problem Title:** ${title}

**Problem Description:**
${description}

Generate ONLY the Python function/class definition with docstring and placeholder logic. Include:
1. Proper function signature with type hints
2. A docstring explaining what the function should do
3. A simple placeholder/stub implementation (just 'pass' or minimal logic)
4. Example test code at the bottom

DO NOT include:
- Full solution
- Multiple helper functions
- Complex logic
- Explanation text outside code

Return ONLY the Python code, nothing else.`;

const generateStarterCode = async (title, description) => {
  try {
    const response = await axios.post(
      'https://api.keywordsai.co/api/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: generateStarterCodePrompt(title, description),
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KEYWORDS_AI_KEY}`,
        },
      }
    );

    const code = response.data.choices?.[0]?.message?.content || '';
    return code.trim();
  } catch (err) {
    console.error(`Error generating code for "${title}":`, err.message);
    return '';
  }
};

async function main() {
  console.log('Fetching problems from Supabase...');
  const { data: problems, error } = await supabase
    .from('LEETCODE PROBLEMS')
    .select('id, title, description, starter_code')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching problems:', error);
    process.exit(1);
  }

  console.log(`Found ${problems.length} problems`);

  let updated = 0;
  let skipped = 0;

  for (const problem of problems) {
    // Skip if starter_code already exists
    if (problem.starter_code && problem.starter_code.trim().length > 0) {
      console.log(`⏭️  Skipping "${problem.title}" (already has starter code)`);
      skipped++;
      continue;
    }

    console.log(`⏳ Generating starter code for "${problem.title}"...`);
    const starterCode = await generateStarterCode(problem.title, problem.description);

    if (starterCode) {
      const { error: updateError } = await supabase
        .from('LEETCODE PROBLEMS')
        .update({ starter_code: starterCode })
        .eq('id', problem.id);

      if (updateError) {
        console.error(`❌ Error updating problem ${problem.id}:`, updateError);
      } else {
        console.log(`✅ Updated "${problem.title}"`);
        updated++;
      }
    } else {
      console.log(`⚠️  Failed to generate code for "${problem.title}"`);
    }

    // Rate limiting - wait 1 second between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Complete! Updated: ${updated}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
