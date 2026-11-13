# FiqihAI — Sistem Tanya Jawab & Rujukan Fiqih Kontemporer

> **Tugas Praktikum Pengembangan Aplikasi Web (PPAW) — Week 7**  
> **Kelas:** E (Kelompok)  
> **Metode SDLC:** Waterfall  
> **Arsitektur:** Model-View-Controller (MVC) — Express.js, EJS, Tailwind CSS (CDN)

---

## 📌 Deskripsi Proyek

Proyek ini adalah implementasi Week 7 untuk aplikasi berkelanjutan **FiqihAI**, yaitu platform sistem tanya jawab fikih kontemporer berbasis kecerdasan buatan (Gemini AI & RAG) yang merujuk pada himpunan fatwa Syekh Dr. Yusuf Al-Qardhawi dan Majelis Tarjih.

Pada Week 7, sistem mengintegrasikan tiga pilar utama:
1. **Halaman Frontend**: Dibangun dengan template engine EJS dan Tailwind CSS CDN, menampilkan live status server, interactive API playground, serta katalog rujukan fikih.
2. **REST API Endpoints**:
   - `GET /api/status`: Informasi kesehatan server, uptime, versi, metode SDLC, dan status aplikasi (JSON).
   - `GET /api/produk`: Katalog modul dan buku rujukan fikih kontemporer yang dikelola melalui Model (Array JSON).
3. **Middleware Logger**: Mencatat seluruh incoming HTTP request (Method, Path/URL, Status Code, Durasi, Timestamp) ke terminal/console backend serta file `logs/logger.md`.

---

## 🚀 Cara Menjalankan

1. **Pasang Dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan Aplikasi**:
   ```bash
   npm start
   # atau untuk mode auto-reload (development):
   npm run dev
   ```

3. **Akses Browser**:
   Buka [http://localhost:3000](http://localhost:3000)

---

## 📡 Daftar Endpoint API

| Endpoint | Method | Keterangan | Format Respon |
|---|---|---|---|
| `/` | `GET` | Halaman Web Utama FiqihAI | HTML (EJS View) |
| `/api/status` | `GET` | Status server, uptime, dan metadata proyek | JSON |
| `/api/produk` | `GET` | Daftar modul & literatur fikih kontemporer | JSON / Array JSON |

> **Catatan Endpoint `/api/produk`:**  
> Secara default mengembalikan respon standar `sukses`, `jumlah`, dan `data` array.  
> Untuk mendapatkan array murni secara langsung, tambahkan parameter query `?format=array` (contoh: `/api/produk?format=array`).

---

## 🪵 Middleware Logger

Setiap request yang masuk dicatat secara *real-time*:
- **Terminal Backend / Console**:  
  `[2026-10-26T12:00:00.000Z] GET /api/produk - Status: 200 (2.4 ms)`
- **File Rekaman**:  
  Tersimpan dalam tabel format Markdown di file `logs/logger.md`.

---

## 📁 Struktur Folder (Sesuai Ketentuan Tugas)

```text
Fiqih-ChatbotAI/
├── config/             # Konfigurasi aplikasi (port, nama, metode SDLC, metadata)
├── models/             # Abstraksi data (produkModel.js - data modul fikih)
├── middlewares/        # Middleware Express (logger.js pencatat HTTP request)
├── controllers/        # Logika pemrosesan (apiController.js, homeController.js)
├── routes/             # Definisi route & pemetaan endpoint (web.js, api.js, index.js)
├── views/              # Template EJS dinamis & reusable partials
│   ├── partials/
│   │   ├── head.ejs
│   │   ├── navbar.ejs
│   │   └── footer.ejs
│   └── index.ejs
├── utils/              # Fungsi pembantu reusable (formatRupiah, logger helper)
├── logs/               # Direktori catatan log request (logger.md)
├── app.js              # Entry point utama inisialisasi Express & server
├── server.js           # Delegasi backward-compatibility ke app.js
└── package.json        # Manifest proyek & dependencies (Express, EJS)
```

---

## 💡 Alasan Pemilihan Metode Waterfall

> *"Kami memilih metode Waterfall karena alur kerjanya linier dan terstruktur, sehingga spesifikasi sistem dapat dikunci di awal untuk mencegah pembesaran yang tidak diinginkan pada ruang lingkup."*

Metode ini sangat tepat untuk proyek sistem tanya jawab hukum Islam (fikih), di mana batasan korpus rujukan fatwa, standarisasi validasi dalil, dan arsitektur API harus didefinisikan secara presisi sebelum tahap pengkodean dan integrasi model AI dilakukan.

---

## 🤖 Week 8 — AI Assistant (Google Gemini)

Halaman: **`/chat`** · Endpoint: **`POST /api/chat`**

```json
// Request
{ "message": "Bagaimana hukum zakat profesi?" }
// Response
{ "success": true, "data": { "reply": "...", "sources": [{ "judul": "...", "penulis": "..." }] } }
```

**Setup:** tambahkan ke `.env` (jangan di-commit)
```
GEMINI_API_KEY=isi_api_key
GEMINI_MODEL=gemini-3.8-flash
```

**Struktur tambahan:** `config/gemini.js`, `services/geminiService.js`, `models/chatModel.js`, `middlewares/validateChatInput.js`, `controllers/chatController.js`, `routes/chat.js`, `views/chat.ejs`.

**Guardrail (berlapis):** validasi pesan kosong/>500 karakter → deteksi prompt injection → gerbang relevansi topik → System Instruction (strict grounding) → penanganan error/timeout/respons kosong Gemini. API key hanya dipakai di backend.

**Opsional — kutipan buku + halaman (sesuai PRD US-02):**
```sql
CREATE TABLE fatwa_chunk (
  id SERIAL PRIMARY KEY,
  sumber TEXT NOT NULL,   -- mis. 'FATWA KONTEMPORER JILID 1.pdf'
  halaman INT NOT NULL,
  isi TEXT NOT NULL
);
```
Jika tabel ini ada dan terisi, Top-3 kutipan otomatis ikut dikirim sebagai context beserta nama sumber & halaman.
