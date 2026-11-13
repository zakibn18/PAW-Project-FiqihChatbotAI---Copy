// Menampilkan model Gemini yang tersedia untuk API key Anda.  Jalankan: npm run models
require('dotenv').config();
(async () => {
  if (!process.env.GEMINI_API_KEY) return console.error('GEMINI_API_KEY belum diisi di .env');
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', {
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY },
  });
  const json = await res.json();
  if (!res.ok) return console.error('Error', res.status, JSON.stringify(json.error || json).slice(0, 300));
  (json.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .forEach((m) => console.log(m.name.replace('models/', '')));
})();
