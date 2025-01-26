const express = require('express');
const pool = require('../db'); // Access the database connection
const router = express.Router();


// GET /setup
router.get('/', async (req, res) => {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS users;
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50),
                email VARCHAR(50)
            );
        `);
        res.status(200).send({ message: "Table created successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.get('/reset', async (req, res) => {
    try {
        await pool.query(`
            DELETE FROM users;
        `);
        res.status(200).send({ message: "Table reset successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.get('/delete', async (req, res) => {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS users;
        `);
        res.status(200).send({ message: "Data deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = router;
