const express = require('express');
const pool = require('../db');
const router = express.Router();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const { isAuthenticated } = require('../auth');
const { isAuthAsAdmin } = require('../auth');

// GET /task/
router.get('/', (req, res) => {
    res.send(`
        <h1 class="text-3xl">Use 
            <br> /add to add a task for this endpoint
            <br> /delete/:id to delete a task by id
            <br> /all to get all task
        `);
}
);

router.post('/add', async (req, res) => {
    // to be added
});




module.exports = router;