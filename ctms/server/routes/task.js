const express = require('express');
const pool = require('../db');
const router = express.Router();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const { isAuthenticated } = require('../auth');
const { isAuthAsAdmin } = require('../auth');

// GET /task/
router.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Endpoint Documentation</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.2/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 min-h-screen p-8 text-gray-100">
    <div class="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-100 mb-6">Task Endpoint Documentation</h1>
        
        <div class="space-y-8">
            <!-- Authentication Note -->
            <div class="bg-gray-700 p-4 rounded-lg">
                <h2 class="text-xl font-semibold text-blue-300 mb-2">Authentication</h2>
                <p class="text-gray-200">All task endpoints require authentication via <code class="bg-gray-600 px-1 rounded">isAuthenticated</code> middleware.</p>
            </div>

            <!-- Endpoints Section -->
            <div class="space-y-6">
                <!-- POST /task/add -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">POST /task/add</h3>
                    <p class="text-gray-300 mt-2">Creates a new task with optional user assignments.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "name": string,       // Required
    "date": date,        // Required
    "description": string,
    "status": "pending" | "in_progress" | "completed",  // Required
    "priority": "low" | "medium" | "high",             // Required
    "assigned_users": number[]  // Optional array of user IDs
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Notes:</h4>
                        <ul class="list-disc ml-5 text-gray-300">
                            <li>Status defaults to "pending" if not provided</li>
                            <li>Priority defaults to "medium" if not provided</li>
                            <li>assigned_users is optional</li>
                        </ul>
                    </div>
                </div>

                <!-- PUT /task/update/:id -->
                <div class="border-l-4 border-yellow-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">PUT /task/update/:id</h3>
                    <p class="text-gray-300 mt-2">Updates an existing task and its assignments.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,        // Required
    "name": string,
    "date": date,
    "description": string,
    "status": "pending" | "in_progress" | "completed",
    "priority": "low" | "medium" | "high",
    "assigned_users": number[]  // Array of user IDs
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Notes:</h4>
                        <ul class="list-disc ml-5 text-gray-300">
                            <li>Updates will replace all existing assignments</li>
                            <li>Existing assignments are removed before new ones are added</li>
                        </ul>
                    </div>
                </div>

                <!-- DELETE /task/delete/:id -->
                <div class="border-l-4 border-red-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">DELETE /task/delete/:id</h3>
                    <p class="text-gray-300 mt-2">Deletes a task by ID.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number  // Required
}
                        </pre>
                    </div>
                </div>

                <!-- GET /task/id/:id -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /task/id/:id</h3>
                    <p class="text-gray-300 mt-2">Retrieves a specific task with all assigned users.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number  // Required
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "name": string,
    "date": date,
    "description": string,
    "status": "pending" | "in_progress" | "completed",
    "priority": "low" | "medium" | "high",
    "assigned_users": [
        {
            "user_id": number,
            "username": string,
            "display_name": string
        }
    ]
}
                        </pre>
                    </div>
                </div>

                <!-- GET /task/assignedto/user/:id -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /task/assignedto/user/:id</h3>
                    <p class="text-gray-300 mt-2">Retrieves all tasks assigned to a specific user.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number  // Required
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
[
    {
        "id": number,
        "name": string,
        "date": date,
        "description": string,
        "status": "pending" | "in_progress" | "completed",
        "priority": "low" | "medium" | "high"
    }
]
                        </pre>
                    </div>
                </div>
            </div>

            <!-- Error Handling -->
            <div class="bg-gray-700 p-4 rounded-lg mt-8">
                <h2 class="text-xl font-semibold text-red-300 mb-2">Error Responses</h2>
                <div class="space-y-2">
                    <p class="text-gray-200"><strong>400:</strong> Missing required fields</p>
                    <p class="text-gray-200"><strong>404:</strong> Task or user not found</p>
                    <p class="text-gray-200"><strong>401:</strong> Unauthorized access</p>
                    <p class="text-gray-200"><strong>500:</strong> Internal server error</p>
                </div>
                <p class="text-gray-200 mt-4">Note: All error responses follow the format: <code class="bg-gray-600 px-1 rounded">{ "message": string }</code></p>
            </div>
        </div>
    </div>
</body>
</html>
        `);
});

// GET /task/all - Fetch all tasks
router.get('/all', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM task ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
});


// POST /task/add - Add a new task
router.post('/add', isAuthenticated, async (req, res) => {
    const { name, date, description, status, priority, assigned_users } = req.body;

    if (!name || !date || !status || !priority) {
        return res.status(400).json({
            message: 'Missing required fields'

        });
    }

    try {
        // Start transaction
        await pool.query('BEGIN');

        // Insert task
        const taskResult = await pool.query(
            `INSERT INTO task (name, date, description, status, priority)
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [name, date, description, status || 'pending', priority || 'medium']
        );

        const taskId = taskResult.rows[0].id;

        // Assign users if provided
        if (assigned_users && assigned_users.length > 0) {
            const assignValues = assigned_users.map(userId => {
                return `(${userId}, ${taskId}, CURRENT_DATE)`;
            }).join(',');

            await pool.query(`
                INSERT INTO AssignedTo (user_id, task_id, assigned_date)
                VALUES ${assignValues}
            `);
        }

        // Commit transaction
        await pool.query('COMMIT');

        res.status(201).json(taskResult.rows[0]);
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ message: 'Failed to create task' });
    }
});

// DELETE /task/delete/:id - Delete a task by ID
router.delete('/delete/:id', isAuthenticated, async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
    }
    try {
        const deleteTask = await pool.query('DELETE FROM task WHERE id = $1 RETURNING *', [id]);

        if (deleteTask.rowCount === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete task' });
    }
});

// PUT /task/update/:id - Update a task by ID
router.put('/update/:id', isAuthenticated, async (req, res) => {
    const { id, name, date, description, status, priority, assigned_users } = req.body;

    try {
        // Start transaction
        await pool.query('BEGIN');

        // Update task
        const taskResult = await pool.query(`
            UPDATE task
            SET name = $1, date = $2, description = $3, status = $4, priority = $5
            WHERE id = $6
            RETURNING *
        `, [name, date, description, status, priority, id]);

        if (taskResult.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Task not found' });
        }

        // Remove existing assignments
        await pool.query('DELETE FROM assignedto WHERE task_id = $1', [id]);

        // Assign users if provided
        if (assigned_users && assigned_users.length > 0) {
            const assignValues = assigned_users.map(userId => {
                return `(${userId}, ${id}, CURRENT_DATE)`;
            }).join(',');

            await pool.query(`
                INSERT INTO AssignedTo (user_id, task_id, assigned_date)
                VALUES ${assignValues}
            `);
        }

        // Commit transaction
        await pool.query('COMMIT');

        res.json(taskResult.rows[0]);
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ message: 'Failed to update task' });
    }
});

// GET /task/:id - Fetch a task by ID
// Should be used to get a specific task with all assigned users
router.get('/id/:id', isAuthenticated, async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
    }
    try {
        const taskResult = await pool.query(`
            SELECT t.id, t.name, t.date, t.description, t.status, t.priority, 
            u.id as user_id, u.username, u.display_name
            FROM task t
            LEFT JOIN assignedto a ON t.id = a.task_id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE t.id = $1
        `, [id]);

        if (taskResult.rowCount === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const task = taskResult.rows[0];
        const assigned_users = taskResult.rows
            .filter(row => row.user_id)
            .map(row => ({
                user_id: row.user_id,
                username: row.username,
                display_name: row.display_name
            }));

        res.json({
            id: task.id,
            name: task.name,
            date: task.date,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assigned_users
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch task' });
    }
});

// GET /assignedto/user/:id - Fetch all tasks assigned to a user
// Should be used to get all tasks assigned to a specific user
router.get('/assignedto/user/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const result = await pool.query(`
            SELECT t.id, t.name, t.date, t.description, t.status, t.priority
            FROM task t
            JOIN assignedto a ON t.id = a.task_id
            WHERE a.user_id = $1
            ORDER BY t.date DESC
        `, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'No tasks found under this user' });
        }
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
});

router.get('/assignedto/all', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM assignedto;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
}
);

module.exports = router;