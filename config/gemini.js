// config/gemini.js
// Konfigurasi integrasi Google Gemini. Semua nilai sensitif dibaca dari .env.
module.exports = {
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 10000,
  fallbackModel: process.env.GEMINI_FALLBACK_MODEL || '', // model cadangan jika model utama sibuk (PRD F-07)
  maxRetry: 1, // jumlah retry per model untuk 429 / 5xx (PRD F-07)
  maxOutputTokens: 2048, // model 3.x memakai sebagian token untuk 'berpikir', jadi dibuat longgar
  temperature: 0.2, // rendah agar jawaban konsisten dan tidak mengarang
  maxMessageLength: 500,
};
