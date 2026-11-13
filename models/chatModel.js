// models/chatModel.js
// Mengambil data dari database sebagai context AI (Top-3 paling relevan).
const db = require('../config/database');
const ProdukModel = require('./produkModel');

const STOPWORDS = new Set([
  'yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'apa', 'apakah', 'bagaimana',
  'bolehkah', 'adalah', 'ini', 'itu', 'saya', 'aku', 'kamu', 'anda', 'ada', 'tidak', 'bisa',
  'hukum', 'dalam', 'pada', 'saja', 'tentang', 'mengenai', 'kah', 'jika', 'kalau', 'seperti', 'para',
]);

// Variasi ejaan yang umum pada literatur fiqih (satu kelompok = kata yang sama)
const VARIAN = [
  ['sholat', 'shalat', 'salat', 'solat'],
  ['wudhu', 'wudu', 'wudlu'],
  ['zakat', 'zakah'],
  ['puasa', 'shaum', 'shiyam', 'saum'],
  ['haid', 'haidh', 'haidl'],
  ['fiqih', 'fikih', 'fiqh'],
  ['hadis', 'hadits'],
  ['syariah', 'syariat', 'shariah'],
  ['qardhawi', 'qaradhawi', 'qaradawi', 'qardawi'],
  ['jenazah', 'janazah'],
  ['thaharah', 'taharah', 'tahaarah'],
  ['sedekah', 'shadaqah', 'sadaqah'],
];
function perluasVarian(token) {
  const grup = VARIAN.find((g) => g.includes(token));
  return grup || [token];
}

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function score(row, tokens) {
  const hay = [row.nama, row.kategori, row.penulis, row.deskripsi].join(' ').toLowerCase();
  return tokens.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
}

const ChatModel = {
  tokenize,

  // Daftar seluruh modul/buku di katalog (dipakai untuk pertanyaan "apa saja yang tersedia?")
  async getCatalog() {
    return ProdukModel.getAll();
  },

  // Top-3 modul katalog yang paling relevan dengan pertanyaan
  async searchCatalog(message, limit = 3) {
    const tokens = tokenize(message);
    const rows = await ProdukModel.getAll();
    const hasil = rows
      .map((r) => ({ row: r, skor: score(r, tokens) }))
      .filter((x) => x.skor > 0)
      .sort((a, b) => b.skor - a.skor)
      .slice(0, limit)
      .map((x) => x.row);
    return { rows, hasil };
  },

  // OPSIONAL: potongan teks buku (chunk) dengan nomor halaman, jika tabel fatwa_chunk dibuat.
  // Skema ada di README. Jika tabel belum ada, fungsi ini mengembalikan [] tanpa error.
  async searchChunks(message, limit = 3) {
    // Tambahkan bentuk tanpa awalan (berwudhu -> wudhu) agar pencarian lebih longgar
    const dasar = tokenize(message).slice(0, 8);
    const tokens = [...new Set(dasar.flatMap(perluasVarian).flatMap((t) => {
      const tanpa = t.replace(/^(ber|ter|meng|men|mem|me|di|ke|pe)/, '');
      return tanpa.length > 3 && tanpa !== t ? [t, tanpa] : [t];
    }))];
    if (!tokens.length) return [];
    try {
      // Skor = (jumlah kata berbeda yang cocok x 100) + (total kemunculan, maks 50 per kata)
      //        + 30 jika kata ada di nama file sumber. Seri diurutkan dari yang paling padat membahas topik.
      const kemunculan = tokens.map((_, i) =>
        `LEAST(50, (LENGTH(isi) - LENGTH(REPLACE(LOWER(isi), LOWER($${i + 1}), ''))) / LENGTH($${i + 1}))`
      );
      const cocok = tokens.map((_, i) => `(CASE WHEN isi ILIKE '%' || $${i + 1} || '%' THEN 100 ELSE 0 END)`);
      const namaFile = tokens.map((_, i) => `(CASE WHEN sumber ILIKE '%' || $${i + 1} || '%' THEN 30 ELSE 0 END)`);
      const skor = [...cocok, ...kemunculan, ...namaFile].join(' + ');
      const filter = tokens.map((_, i) => `isi ILIKE '%' || $${i + 1} || '%'`).join(' OR ');
      const res = await db.query(
        `SELECT sumber, halaman, isi, (${skor}) AS skor FROM fatwa_chunk
         WHERE ${filter} ORDER BY skor DESC, id LIMIT ${Number(limit)}`,
        tokens
      );
      return res.rows;
    } catch (err) {
      if (err.code === '42P01') return []; // tabel belum ada
      throw err;
    }
  },
};

module.exports = ChatModel;
