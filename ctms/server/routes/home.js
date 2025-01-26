const express = require('express');
const pool = require('../db'); // Access the database connection
const router = express.Router();

//CREATE TABLE users (
// id SERIAL PRIMARY KEY,
// username VARCHAR(50),
// email VARCHAR(50)
// );


router.get('/', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM users');
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Internal Server Error: Is database setup yet?' });
    }
});


router.post('/', async (req, res) => {
    const { username, email } = req.body;
    try {
        await pool.query(`
            INSERT INTO users (username, email) VALUES ($1, $2);
        `, [username, email]);
        res.status(200).send({
            message: "Successfully added user",
        });
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

module.exports = router;
