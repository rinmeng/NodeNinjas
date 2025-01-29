const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
    res.send(`
        <h1>Use 
        <br> /add to add a user for this endpoint
        <br> /delete/:id to delete a user by id</h1>
        
        `);
});

router.get('/add', (req, res) => {
    res.send('<h1>Add a user by sending a POST request to this endpoint</h1>');
});

router.post('/add', async (req, res) => {
    const { username, email } = req.body;
    if (!username || !email) {
        return res.status(400).send({ message: "Username and email are required" });
    }
    try {
        const result = await pool.query(
            `INSERT INTO users (username, email) VALUES ($1, $2);`,
            [username, email]
        );
        if (result.rowCount === 0) {
            return res.status(400).json({ error: "User not added" });
        }
        res.json({ message: "User added successfully" });
    } catch (err) {
        console.error('Error adding user:', err.message);

        // Respond with a 500 status code on error
        res.status(500).send({
            error: "An error occurred while adding the user",
        });
    }
});

router.get('/delete', (req, res) => {
    res.send('<h1>Delete a user by sending a DELETE request to this endpoint</h1>');
});

router.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    }
    catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).send({
            error: "An error occurred while deleting the user",
        });
    }
});

router.get('/all', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM users');
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Internal Server Error: Is database setup yet?' });
    }
});
module.exports = router;
