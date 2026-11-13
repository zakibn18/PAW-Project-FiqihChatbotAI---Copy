// middlewares/validateChatInput.js
// Lapisan guardrail di backend (tidak hanya mengandalkan System Prompt).
const gemini = require('../config/gemini');
const ChatModel = require('../models/chatModel');

const MSG_TOLAK_INJEKSI =
  'Maaf, saya tidak dapat memenuhi permintaan tersebut. Saya hanya dapat membantu menjawab pertanyaan seputar fiqih kontemporer dan informasi yang tersedia di aplikasi FiqihAI.';
const MSG_TOLAK_KONTEKS =
  'Maaf, pertanyaan tersebut di luar cakupan FiqihAI. Saya hanya dapat membantu seputar fiqih kontemporer (ibadah, zakat, muamalah, dsb.) dan modul/buku rujukan yang tersedia di aplikasi ini. Silakan ajukan pertanyaan terkait topik tersebut.';

// Pola prompt injection umum (Indonesia & Inggris)
const INJECTION_PATTERNS = [
  /(abaikan|lupakan|hiraukan|kesampingkan|ganti)\b.{0,40}\b(instruksi|aturan|perintah|batasan|prompt)/i,
  /ignore\b.{0,40}\b(instruction|rule|prompt|previous|above)/i,
  /disregard\b.{0,40}\b(instruction|rule|prompt)/i,
  /(system|sistem)\s*prompt|prompt\s*sistem|instruksi\s*sistem|system\s*instruction/i,
  /(tampilkan|tunjukkan|bocorkan|ungkap|sebutkan|reveal|show|print)\b.{0,40}\b(instruksi|prompt|aturan|api[\s_-]?key|kunci api|konfigurasi|\.env)/i,
  /(kamu|anda|kau)\s+(sekarang\s+)?(adalah|menjadi|berperan|bertindak)\b/i,
  /\b(act as|pretend|roleplay|role-play|jailbreak|developer mode|dan mode|you are now)\b/i,
  /(berpura-pura|pura-pura)\s+(jadi|menjadi|sebagai)/i,
  /<\s*\/?\s*(system|instruction)/i,
];

// Kata kunci topik aplikasi (fiqih & katalog). Dipakai sebagai gerbang relevansi awal.
const TOPIK = new RegExp(
  [
    'fiqih', 'fikih', 'fatwa', 'hukum', 'halal', 'haram', 'makruh', 'mubah', 'sunnah', 'sunah', 'wajib',
    'boleh', 'dalil', 'syariah', 'syariat', 'islam', 'quran', 'al-quran', 'hadis', 'hadits', 'ulama', 'qardhawi',
    'shalat', 'salat', 'sholat', 'solat', 'puasa', 'shaum', 'shiyam', 'saum', 'zakat', 'infak', 'sedekah', 'wakaf', 'haji', 'umrah', 'qurban', 'kurban',
    'wudhu', 'wudu', 'wudlu', 'tayammum', 'thaharah', 'bersuci', 'najis', 'haid', 'nifas', 'junub', 'mandi wajib', 'jenazah',
    'muamalah', 'riba', 'bank', 'asuransi', 'saham', 'kredit', 'utang', 'jual beli', 'investasi', 'kripto', 'gadai',
    'nikah', 'pernikahan', 'talak', 'cerai', 'waris', 'mahar', 'aurat', 'jilbab', 'musik', 'donor', 'transplantasi',
    'bayi tabung', 'kb', 'aborsi', 'vaksin', 'makanan', 'minuman', 'gelatin',
    'buku', 'kitab', 'modul', 'katalog', 'referensi', 'rujukan', 'sumber', 'penulis', 'tersedia', 'aplikasi', 'fitur',
    'informasi', 'harga', 'stok', 'format', 'kategori',
  ].join('|'),
  'i'
);
const SAPAAN = /^(halo|hai|hi|hello|assalamu'?alaikum|assalamualaikum|salam|selamat (pagi|siang|sore|malam)|terima kasih|makasih|syukron|jazakallah)\b/i;

module.exports = async (req, res, next) => {
  const raw = req.body && req.body.message;

  if (typeof raw !== 'string' || !raw.trim()) {
    return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong.' });
  }
  const message = raw.replace(/\s+/g, ' ').trim();
  if (message.length > gemini.maxMessageLength) {
    return res.status(400).json({
      success: false,
      message: `Pesan terlalu panjang (maksimal ${gemini.maxMessageLength} karakter).`,
    });
  }

  // Penolakan di backend tetap dikembalikan sebagai "success" agar tampil sebagai balasan di chat
  const tolak = (reply, alasan) =>
    res.json({ success: true, data: { reply, sources: [], blocked: true, reason: alasan } });

  if (INJECTION_PATTERNS.some((re) => re.test(message))) return tolak(MSG_TOLAK_INJEKSI, 'prompt_injection');

  if (!SAPAAN.test(message) && !TOPIK.test(message)) {
    // Fallback: apakah ada kata yang cocok dengan isi katalog di database?
    try {
      const { hasil } = await ChatModel.searchCatalog(message, 1);
      if (!hasil.length) return tolak(MSG_TOLAK_KONTEKS, 'out_of_context');
    } catch (err) {
      return next(err);
    }
  }

  req.body.message = message;
  next();
};
