const express = require('express');
const chatController = require('../controllers/chatController');
const validateChatInput = require('../middlewares/validateChatInput');

const router = express.Router();

// Dipasang di /api  =>  POST /api/chat
router.post('/chat', validateChatInput, chatController.chat);

module.exports = router;
