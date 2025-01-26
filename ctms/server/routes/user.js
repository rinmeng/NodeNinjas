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

    // Validate input
    if (!username || !email) {
        return res.status(400).send({ message: "Username and email are required" });
    }

    try {
        // Insert user into the database
        await pool.query(
            `INSERT INTO users (username, email) VALUES ($1, $2);`,
            [username, email]
        );

        // Respond with success
        res.status(201).send({
            message: "Successfully added user",
        });
    } catch (err) {
        console.error('Error adding user:', err.message);

        // Respond with a 500 status code on error
        res.status(500).send({
            message: "An error occurred while adding the user",
        });
    }
});

router.get('/delete', (req, res) => {
    res.send('<h1>Delete a user by sending a DELETE request to this endpoint</h1>');
});

router.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // Delete the user from the database
        await pool.query(
            `DELETE FROM users WHERE id = $1;`,
            [id]
        );

        // Respond with success
        res.status(200).send({
            message: "Successfully deleted user",
        });
    }
    catch (err) {
        console.error('Error deleting user:', err.message);

        // Respond with a 500 status code on error
        res.status(500).send({
            message: "An error occurred while deleting the user",
        });
    }
});
module.exports = router;
