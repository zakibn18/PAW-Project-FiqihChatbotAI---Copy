const ProdukModel = require('../models/produkModel');
const config = require('../config');

exports.status = (req, res) => {
  res.json({
    status: 'ok',
    aplikasi: config.appTitle,
    kelas: config.kelas,
    metodePengembangan: config.metodePengembangan,
    versi: config.versi,
    uptimeDetik: Math.round(process.uptime()),
    waktuServer: new Date().toISOString(),
  });
};

exports.produk = async (req, res) => {
  try {
    const data = await ProdukModel.getAll();
    if (req.query.format === 'array') return res.json(data);
    res.json({ sukses: true, jumlah: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProdukById = async (req, res) => {
  try {
    const data = await ProdukModel.getById(req.params.id);
    data ? res.json(data) : res.status(404).json({ pesan: 'Tidak ditemukan' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createProduk = async (req, res) => {
  try {
    const newData = await ProdukModel.create(req.body);
    res.status(201).json({ sukses: true, data: newData });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateProduk = async (req, res) => {
  try {
    const updatedData = await ProdukModel.update(req.params.id, req.body);
    res.json({ sukses: true, data: updatedData });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteProduk = async (req, res) => {
  try {
    await ProdukModel.delete(req.params.id);
    res.json({ sukses: true, pesan: 'Data dihapus' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};