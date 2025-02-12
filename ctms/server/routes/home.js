const express = require('express');
const pool = require('../db'); // Database connection
const router = express.Router();
const proxy = "http://localhost:15000"; // Store base URL in a variable

router.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.2/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen p-8">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">API Documentation</h1>
        
        <div class="space-y-8">
            <!-- Welcome Section -->
            <div class="bg-blue-50 p-6 rounded-lg">
                <h2 class="text-2xl font-semibold text-blue-800 mb-4">Welcome to the API Documentation</h2>
                <p class="text-blue-700 mb-4">This documentation provides access to all available endpoints. Click on any endpoint below to view its detailed documentation.</p>
            </div>

            <!-- Endpoints Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- User Endpoint -->
                <a href="${proxy}/user" class="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition duration-300">
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">User Endpoint</h3>
                    <p class="text-gray-600">User management and authentication</p>
                </a>

                <!-- Task Endpoint -->
                <a href="${proxy}/task" class="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition duration-300">
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Task Endpoint</h3>
                    <p class="text-gray-600">Task creation and management</p>
                </a>

                <!-- Setup Endpoint -->
                <a href="${proxy}/setup" class="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition duration-300">
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Setup Endpoint</h3>
                    <p class="text-gray-600">Database setup and initialization</p>
                </a>

                <!-- Notification Endpoint -->
                <a href="${proxy}/notification" class="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition duration-300">
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Notification Endpoint</h3>
                    <p class="text-gray-600">User notifications management</p>
                </a>

                <!-- Message Endpoint -->
                <a href="${proxy}/message" class="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition duration-300">
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Message Endpoint</h3>
                    <p class="text-gray-600">Message handling and task discussions</p>
                </a>

                <!-- AssignedTo Endpoint -->
                <a href="${proxy}/task" class="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition duration-300">
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">AssignedTo Endpoint</h3>
                    <p class="text-gray-600">Is hosted under the Task Endpoint</p>
                </a>
            </div>

            <!-- Additional Info -->
            <div class="bg-yellow-50 p-6 rounded-lg mt-8">
                <h2 class="text-xl font-semibold text-yellow-800 mb-2">Getting Started</h2>
                <p class="text-yellow-700">The API is hosted at <code class="bg-yellow-100 px-2 py-1 rounded">${proxy}</code></p>
                <p class="text-yellow-700 mt-2">Click on any endpoint above to view its detailed documentation and available routes.</p>
            </div>
        </div>
    </div>
</body>
</html>`);

});

// // GET /task/all - Fetch all tasks
// router.get('/all', async (req, res) => {
//     try {
//         const result = await pool.query("SELECT * FROM Task ORDER BY date DESC");
//         res.json(result.rows);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send("Server Error");
//     }
// });

// // POST /task/add - Add a new task
// router.post('/add', async (req, res) => {
//     const { name, date, status, priority } = req.body;
//     if (!name || !date || !status || !priority) {
//         return res.status(400).json({ error: "All fields are required" });
//     }

//     try {
//         const newTask = await pool.query(
//             "INSERT INTO Task (name, date, status, priority) VALUES ($1, $2, $3, $4) RETURNING *",
//             [name, date, status, priority]
//         );
//         res.json(newTask.rows[0]);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send("Server Error");
//     }
// });

// // DELETE /task/delete/:id - Delete a task by ID
// router.delete('/delete/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const deleteTask = await pool.query("DELETE FROM Task WHERE id = $1 RETURNING *", [id]);
//         if (deleteTask.rowCount === 0) {
//             return res.status(404).json({ error: "Task not found" });
//         }
//         res.json({ message: "Task deleted successfully" });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send("Server Error");
//     }
// });

module.exports = router;
