// Impor buku PDF ke tabel fatwa_chunk (sumber, halaman, isi).
// Pemakaian:  npm run import-pdf              -> baca semua PDF di folder ./pdf
//             npm run import-pdf -- "D:\buku"  -> baca folder lain
// Aman dijalankan ulang: data lama dari file yang sama dihapus dulu.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const db = require('../config/database');

const UKURAN_CHUNK = 1000; // karakter per potongan
const OVERLAP = 150;

// Ambil teks per halaman (nomor halaman = urutan halaman di file PDF)
async function bacaHalaman(file) {
  const parser = new PDFParse({ data: fs.readFileSync(file) });
  try {
    const hasil = await parser.getText();
    return hasil.pages.map((p) => p.text);
  } finally {
    await parser.destroy();
  }
}

function bersihkan(t) {
  return t.replace(/\u0000/g, '').replace(/\s+/g, ' ').trim();
}

// Pecah teks satu halaman menjadi potongan ~1000 karakter, dipotong di batas kalimat/spasi
function pecah(teks) {
  if (teks.length <= UKURAN_CHUNK) return [teks];
  const hasil = [];
  let mulai = 0;
  while (mulai < teks.length) {
    let akhir = Math.min(mulai + UKURAN_CHUNK, teks.length);
    if (akhir < teks.length) {
      const titik = teks.lastIndexOf('. ', akhir);
      const spasi = teks.lastIndexOf(' ', akhir);
      const batas = titik > mulai + UKURAN_CHUNK * 0.6 ? titik + 1 : spasi > mulai ? spasi : akhir;
      akhir = batas;
    }
    hasil.push(teks.slice(mulai, akhir).trim());
    if (akhir >= teks.length) break;
    mulai = Math.max(akhir - OVERLAP, mulai + 1);
    // Majukan ke awal kata berikutnya agar potongan tidak diawali di tengah kata
    const spasiBerikut = teks.indexOf(' ', mulai);
    if (spasiBerikut !== -1 && spasiBerikut < akhir) mulai = spasiBerikut + 1;
  }
  return hasil.filter(Boolean);
}

(async () => {
  const folder = path.resolve(process.argv[2] || path.join(__dirname, '..', 'pdf'));
  if (!fs.existsSync(folder)) {
    console.error(`Folder tidak ditemukan: ${folder}\nBuat folder "pdf" di root project lalu taruh file PDF di dalamnya, atau berikan path folder.`);
    process.exit(1);
  }
  const files = fs.readdirSync(folder).filter((f) => f.toLowerCase().endsWith('.pdf'));
  if (!files.length) {
    console.error(`Tidak ada file .pdf di ${folder}`);
    process.exit(1);
  }

  await db.query(`CREATE TABLE IF NOT EXISTS fatwa_chunk (
    id SERIAL PRIMARY KEY,
    sumber TEXT NOT NULL,
    halaman INT NOT NULL,
    isi TEXT NOT NULL
  )`);

  for (const f of files) {
    process.stdout.write(`${f} ... `);
    try {
      const halaman = await bacaHalaman(path.join(folder, f));
      await db.query('DELETE FROM fatwa_chunk WHERE sumber = $1', [f]);
      let jumlah = 0;
      let kosong = 0;
      for (let i = 0; i < halaman.length; i++) {
        const teks = bersihkan(halaman[i]);
        if (teks.length < 30) { kosong++; continue; }
        for (const c of pecah(teks)) {
          await db.query('INSERT INTO fatwa_chunk (sumber, halaman, isi) VALUES ($1, $2, $3)', [f, i + 1, c]);
          jumlah++;
        }
      }
      console.log(`${halaman.length} halaman, ${jumlah} potongan` + (kosong ? ` (${kosong} halaman kosong/tanpa teks)` : ''));
      if (jumlah === 0) console.warn('  PERINGATAN: tidak ada teks terbaca. PDF mungkin hasil scan (gambar) dan perlu OCR.');
    } catch (err) {
      console.log('GAGAL: ' + err.message);
    }
  }
  await db.end();
})();
