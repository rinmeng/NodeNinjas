const express = require('express');
const pool = require('../db');
const router = express.Router();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const { isAuthenticated } = require('../auth');
const { isAuthAsAdmin } = require('../auth');

// GET /task/
router.get('/', async (req, res) => {
    res.send('Task route, to be implemented');
});

module.exports = router;