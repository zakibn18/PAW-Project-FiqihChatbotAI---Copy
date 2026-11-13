const express = require('express');
const homeController = require('../controllers/homeController');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.get('/', homeController.index);
router.get('/chat', chatController.page);

module.exports = router;
