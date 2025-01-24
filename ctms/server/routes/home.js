const express = require('express');
const pool = require('../db'); // Access the database connection
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM schools');
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Internal Server Error. Is database setup properly?' });
    }
});


router.post('/', async (req, res) => {
    const { name, location } = req.body;
    try {
        await pool.query(`
            INSERT INTO schools (name, location) VALUES ($1, $2)`, [name, location]);
        res.status(200).send({
            message: "Successfully added school",
        });
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

module.exports = router;
