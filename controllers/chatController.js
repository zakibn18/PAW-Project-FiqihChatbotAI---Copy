// controllers/chatController.js
const geminiService = require('../services/geminiService');
const config = require('../config');
const gemini = require('../config/gemini');

// GET /chat — halaman AI Assistant
exports.page = (req, res) => {
  res.render('chat', {
    judul: `${config.appName} - Tanya Fiqih (AI Assistant)`,
    config,
    maxLength: gemini.maxMessageLength,
  });
};

// POST /api/chat
exports.chat = async (req, res) => {
  try {
    const { reply, sources } = await geminiService.tanya(req.body.message);
    res.json({ success: true, data: { reply, sources } });
  } catch (err) {
    const status = err.status || 500;
    if (!err.status) console.error('[chat] Error tak terduga:', err);
    res.status(status).json({
      success: false,
      message: err.status ? err.message : 'Terjadi kesalahan pada server.',
    });
  }
};
