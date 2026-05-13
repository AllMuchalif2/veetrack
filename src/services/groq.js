import { db } from './db';

export async function fetchAI(prompt, systemInstruction = '') {
  const setting = await db.settings.get('API_KEY');
  if (!setting || !setting.value) {
    throw new Error('API Key Groq belum diatur.');
  }

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${setting.value}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal menghubungi Groq API (Status: ${response.status})`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
