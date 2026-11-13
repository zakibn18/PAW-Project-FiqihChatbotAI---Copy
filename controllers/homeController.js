const ProdukModel = require('../models/produkModel');
const config = require('../config');
const utils = require('../utils');

exports.index = async (req, res) => {
  try {
    // Tambahkan await untuk mengambil data dari database
    const produk = await ProdukModel.getAll(); 
    
    res.render('index', {
      judul: `${config.appName} - Asisten Fiqih Kontemporer & Modul Fatwa`,
      config,
      produk,
      utils,
    });
  } catch (err) {
    res.status(500).send("Gagal memuat halaman: " + err.message);
  }
};