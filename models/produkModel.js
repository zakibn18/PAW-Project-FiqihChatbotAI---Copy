// models/produkModel.js
const db = require('../config/database');

const ProdukModel = {
  async getAll() {
    const result = await db.query('SELECT * FROM produk');
    return result.rows;
  },
  async getById(id) {
    const result = await db.query('SELECT * FROM produk WHERE id = $1', [id]);
    return result.rows[0];
  },
  async create(data) {
    const result = await db.query(
      'INSERT INTO produk (nama, kategori, penulis, deskripsi, harga, stok, format) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [data.nama, data.kategori, data.penulis, data.deskripsi, data.harga, data.stok, data.format]
    );
    return result.rows[0];
  },
  async update(id, data) {
    const result = await db.query(
      'UPDATE produk SET nama=$1, kategori=$2, penulis=$3, deskripsi=$4, harga=$5, stok=$6, format=$7 WHERE id=$8 RETURNING *',
      [data.nama, data.kategori, data.penulis, data.deskripsi, data.harga, data.stok, data.format, id]
    );
    return result.rows[0];
  },
  async delete(id) {
    await db.query('DELETE FROM produk WHERE id = $1', [id]);
  }
};
module.exports = ProdukModel;