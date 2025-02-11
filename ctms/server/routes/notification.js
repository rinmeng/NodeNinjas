const express = require('express');
const pool = require('../db');
const router = express.Router();
const { isAuthenticated } = require('../auth');

// GET /notification
router.get('/', async (req, res) => {
    res.send('Notification route, to be implemented');
});

module.exports = router;