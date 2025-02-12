const express = require('express');
const pool = require('../db');
const router = express.Router();
const { isAuthenticated } = require('../auth');
const { isAuthAsAdmin } = require('../auth');


// GET /message
router.get('/', async (req, res) => {
    res.send('Messages route, to be implemented');
});



module.exports = router;