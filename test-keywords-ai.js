import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.VITE_KEYWORDS_AI_API_KEY;
console.log('Testing Keywords AI API...');
console.log(`API Key: ${apiKey?.slice(0, 10)}... (redacted)`);

if (!apiKey) {
  console.error('❌ No API key found in .env.local');
  process.exit(1);
}

const testPrompt = 'Say hello briefly.';

async function test() {
  try {
    console.log('\n📡 Attempting request with Bearer token...');
    
    const response = await axios.post(
      'https://api.keywordsai.co/api/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: testPrompt,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 10000,
      }
    );

    console.log('✅ SUCCESS!');
    console.log('Response:', response.data.choices[0]?.message?.content);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    // Try alternative header
    try {
      console.log('\n📡 Attempting request with X-API-KEY header...');
      
      const response = await axios.post(
        'https://api.keywordsai.co/api/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: testPrompt,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey,
          },
          timeout: 10000,
        }
      );

      console.log('✅ SUCCESS with X-API-KEY!');
      console.log('Response:', response.data.choices[0]?.message?.content);
      process.exit(0);
    } catch (error2) {
      console.error('❌ Also failed with X-API-KEY');
      console.error('Status:', error2.response?.status);
      console.error('Data:', error2.response?.data);
      process.exit(1);
    }
  }
}

test();
