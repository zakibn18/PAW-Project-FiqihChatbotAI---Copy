const express = require('express');
const webRoutes = require('./web');
const apiRoutes = require('./api');
const chatRoutes = require('./chat');

const router = express.Router();

router.use('/api', chatRoutes);
router.use('/api', apiRoutes);
router.use('/', webRoutes);

module.exports = router;
