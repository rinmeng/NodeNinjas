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
        res.status(500).send({ error: 'Internal Server Error: Is database setup yet? http://localhost:15000/setup' });
    }
});

module.exports = router;
