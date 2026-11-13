-- Buat tabel produk
CREATE TABLE produk (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    kategori VARCHAR(100),
    penulis VARCHAR(150),
    deskripsi TEXT,
    harga INT,
    stok INT,
    format VARCHAR(100)
);

-- Masukkan data awal (migrasi dari file produkModel.js lama)
INSERT INTO produk (nama, kategori, penulis, deskripsi, harga, stok, format) VALUES 
('Fatwa Fiqih Kontemporer (Edisi Lengkap)', 'Literatur Utama', 'Dr. Yusuf Al-Qardhawi', 'Kumpulan fatwa komprehensif terkait problematika umat modern, hak asasi, dan tantangan zaman baru.', 145000, 35, 'Buku Cetak & Digital'),
('Fiqih Muamalah Digital, Kripto, & Paylater', 'Muamalah Modern', 'Tim Pakar Majelis Tarjih & DSN', 'Kajian hukum akad digital, mata uang kripto (cryptocurrency), pinjaman online, dan mekanisme paylater.', 85000, 50, 'Modul PDF & Akses AI'),
('Panduan Fiqih Zakat Saham, Reksadana, & Portofolio', 'Zakat & Keuangan', 'Dr. Yusuf Al-Qardhawi', 'Nisab, haul, dan kalkulasi zakat modern untuk aset pasar modal, instrumen investasi, dan penghasilan profesi.', 72000, 42, 'Buku Saku & Kalkulator Digital'),
('Fiqih Medis, Vaksinasi, & Bioetika Genomik', 'Medis & Sains', 'Konsorsium Ulama & Dokter Muslim', 'Tinjauan syariat seputar transplantasi organ, terapi gen, vaksin halal, dan batas etika kedokteran modern.', 95000, 28, 'E-Book Terindeks'),
('Kompilasi Standar Halal Lifestyle & Titik Kritis Kosmetik', 'Gaya Hidup & Konsumsi', 'Lembaga Pemeriksa Halal & Riset Syariah', 'Analisis kehalalan bahan aditif pangan (E-numbers), produk perawatan kulit, dan integritas rantai pasok halal.', 68000, 60, 'Buku Panduan & Database'),
('Etika Kecerdasan Buatan (AI) & Privasi Data dalam Islam', 'Teknologi & Etika', 'Pusat Studi Islam Kontemporer', 'Prinsip maqashid syariah dalam pemanfaatan model generatif, perlindungan privasi data pribadi, dan bias algoritma.', 89000, 25, 'Modul Riset Eksklusif');