const express = require('express');

//import routes
// const userRoutes = require('./users');
const agentRoutes = require('./agents');


const router = express.Router();

//mount routes
// router.use('/users', userRoutes); //Users
router.use('/agents', agentRoutes)

module.exports = router;