const express = require('express');
const pool = require('../db'); // Database connection
const router = express.Router();

// GET /task/ - Welcome message
router.get('/', (req, res) => {
    res.send(`
        <h1 class="text-3xl">Use 
            <br> /add to add a task for this endpoint
            <br> /delete/:id to delete a task by id
            <br> /all to get all tasks
        `);
});

// GET /task/all - Fetch all tasks
router.get('/all', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Task ORDER BY date DESC");
        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// POST /task/add - Add a new task
router.post('/add', async (req, res) => {
    const { name, date, status, priority } = req.body;
    if (!name || !date || !status || !priority) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const newTask = await pool.query(
            "INSERT INTO Task (name, date, status, priority) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, date, status, priority]
        );
        res.json(newTask.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// DELETE /task/delete/:id - Delete a task by ID
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteTask = await pool.query("DELETE FROM Task WHERE id = $1 RETURNING *", [id]);
        if (deleteTask.rowCount === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
