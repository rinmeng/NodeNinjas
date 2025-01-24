const express = require('express');
const pool = require('../db'); // Access the database connection
const router = express.Router();

// GET /setup
router.get('/', async (req, res) => {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS schools;
            CREATE TABLE schools (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                location VARCHAR(255)
            )
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
            DELETE FROM schools;
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
            DROP TABLE IF EXISTS schools;
        `);
        res.status(200).send({ message: "Data deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = router;
