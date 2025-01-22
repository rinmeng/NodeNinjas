const express = require('express');
const pool = require('./db'); // Ensure this is correctly configured
const cors = require('cors');
const PORT = 5000;

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Route: Home
app.get('/', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM schools'); // Use `await` here
        res.status(200).json(data.rows); // Send the rows as a JSON response
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Route: API
app.get('/api', (req, res) => {
    res.json({ "users": ["user1", "user2", "user3", "user4"] });
});

// Route: POST Handler
app.post('/', async (req, res) => {
    const { name, location } = req.body;
    try {
        await pool.query(`
            INSERT INTO schools (name, location) VALUES ($1, $2)`, [name, location]);
        res.status(200).send({
            message: "Successfully added child",
        });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Route: Setup
app.get('/setup', async (req, res) => {
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

// Start the server
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log('Visit it at: http://localhost:' + PORT);
});
