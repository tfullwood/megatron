const express = require('express');

const agentRoutes = require('./agents');

const router = express.Router();

router.use('/agents', agentRoutes)

module.exports = router;