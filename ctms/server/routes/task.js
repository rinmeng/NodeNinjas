const express = require('express');
const pool = require('../db');
const router = express.Router();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { isAuthenticated } = require('../auth');
const { isAuthAsAdmin } = require('../auth');

// GET / - Main task endpoint documentation
router.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Endpoint Documentation</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.2/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 min-h-screen p-8">
    <div class="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-100 mb-6">User Endpoint Documentation</h1>
        
        <div class="space-y-8">
            <!-- Authentication Note -->
            <div class="bg-gray-700 p-4 rounded-lg">
                <h2 class="text-xl font-semibold text-blue-300 mb-2">Authentication</h2>
                <p class="text-gray-200">Some endpoints require authentication. Admin-only routes are protected by <code class="bg-gray-600 px-1 rounded">isAuthAsAdmin</code> middleware, and user routes are protected by <code class="bg-gray-600 px-1 rounded">isAuthenticated</code> middleware.</p>
            </div>

            <!-- Endpoints Section -->
            <div class="space-y-6">
                <!-- GET / -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /user/</h3>
                    <p class="text-gray-300 mt-2">Returns the main user endpoint documentation page.</p>
                </div>

                <!-- GET /user/all -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /user/all</h3>
                    <p class="text-gray-300 mt-2">Retrieves all users from the database.</p>
                    <div class="mt-2">
                        <span class="bg-red-900 text-red-100 text-sm font-medium px-2 py-1 rounded">Admin Only</span>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "username": string,
    "role": string,
    "display_name": string,
    "manager_id": number
}[]
                        </pre>
                    </div>
                </div>

                <!-- GET /user/userid/:id -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /user/userid/:id</h3>
                    <p class="text-gray-300 mt-2">Retrieves a user by their ID.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">id</code> - User ID (number)</p>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "username": string,
    "email": string,
    "role": string,
    "display_name": string,
    "manager_id": number
}
                        </pre>
                    </div>
                </div>

                <!-- GET /user/username/:username -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /user/username/:username</h3>
                    <p class="text-gray-300 mt-2">Retrieves a user by their username.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">username</code> - Username (string)</p>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "username": string,
    "email": string,
    "role": string,
    "display_name": string,
    "manager_id": number
}
                        </pre>
                    </div>
                </div>

                <!-- GET /user/under/:manager_id -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /user/under/:manager_id</h3>
                    <p class="text-gray-300 mt-2">Retrieves all users under a specific manager.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">manager_id</code> - Manager ID (number)</p>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
[
    {
        "id": number,
        "username": string,
        "email": string,
        "role": string,
        "display_name": string,
        "manager_id": number
    }
]
                        </pre>
                    </div>
                </div>

                <!-- DELETE /user/delete/:id -->
                <div class="border-l-4 border-red-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">DELETE /user/delete/:id</h3>
                    <p class="text-gray-300 mt-2">Deletes a user by their ID.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">id</code> - User ID to delete (number)</p>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "message": "User deleted successfully"
}
                        </pre>
                    </div>
                </div>

                <!-- POST /user/register -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">POST /user/register</h3>
                    <p class="text-gray-300 mt-2">Registers a new user in the database.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "username": string,
    "email": string,
    "password_hash": string,
    "role": string,
    "display_name": string,
    "manager_id": number
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "message": "User registered successfully"
}
                        </pre>  
                    </div>
                </div>

                <!-- PUT /user/update/:id -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">PUT /user/update/:id</h3>
                    <p class="text-gray-300 mt-2">Updates a user's information by their ID.</p>
                    <div class="mt-2">
                        <span class="bg-red-900 text-red-100 text-sm font-medium px-2 py-1 rounded">Admin Only</span>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "username": string,
    "email": string,
    "password_hash": string,
    "role": string,
    "display_name": string,
    "manager_id": number
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "username": string,
    "email": string,
    "role": string,
    "display_name": string,
    "manager_id": number
}
                        </pre>
                    </div>
                </div>

                <!-- PUT /user/updateRole/:id -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">PUT /user/updateRole/:id</h3>
                    <p class="text-gray-300 mt-2">Updates a user's role by their ID.</p>
                    <div class="mt-2">
                        <span class="bg-red-900 text-red-100 text-sm font-medium px-2 py-1 rounded">Admin Only</span>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">id</code> - User ID (number)</p>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "role": string
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "username": string,
    "email": string,
    "role": string,
    "display_name": string,
    "manager_id": number
}
                        </pre>
                    </div>
                </div>

                <!-- PUT /user/change_manager_id/:id -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">PUT /user/change_manager_id/:id</h3>
                    <p class="text-gray-300 mt-2">Updates a user's manager by their ID.</p>
                    <div class="mt-2">
                        <span class="bg-red-900 text-red-100 text-sm font-medium px-2 py-1 rounded">Admin Only</span>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">id</code> - User ID (number)</p>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "manager_id": number
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "username": string,
    "email": string,
    "role": string,
    "display_name": string,
    "manager_id": number
}
                        </pre>
                    </div>
                </div>

                <!-- POST /user/login -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">POST /user/login</h3>
                    <p class="text-gray-300 mt-2">Authenticates a user and creates a session.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "username": string,
    "password_hash": string,
    "isRemembered": boolean
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "message": "Login successful",
    "session": {
        "user": {
            "id": number,
            "username": string,
            "role": string,
            "display_name": string,
            "manager_id": number
        },
        "maxAge": number
    }
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Notes:</h4>
                        <ul class="list-disc ml-5 text-gray-300">
                            <li>Session expires in 30 days if <code class="bg-gray-600 px-1 rounded">isRemembered</code> is true</li>
                            <li>Session expires in 1 hour if <code class="bg-gray-600 px-1 rounded">isRemembered</code> is false</li>
                        </ul>
                    </div>
                </div>

                <!-- POST /user/logout -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">POST /user/logout</h3>
                    <p class="text-gray-300 mt-2">Destroys the current user session and clears session cookie.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "message": "Logout successful"
}
                        </pre>
                    </div>
                </div>

                <!-- GET /user/session -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /user/session</h3>
                    <p class="text-gray-300 mt-2">Retrieves current session information including user details and expiration.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response (Active Session):</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "isValid": true,
    "expiresIn": number,
    "user": {
        "id": number,
        "username": string,
        "role": string,
        "display_name": string,
        "manager_id": number
    }
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response (No Session):</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "message": "No active session"
}
                        </pre>
                    </div>
                </div>
            </div>

            <!-- Error Handling -->
            <div class="bg-gray-700 p-4 rounded-lg mt-8">
                <h2 class="text-xl font-semibold text-yellow-300 mb-2">Error Responses</h2>
                <div class="space-y-2">
                    <p class="text-gray-200"><strong>400:</strong> Bad request (missing required fields)</p>
                    <p class="text-gray-200"><strong>401:</strong> Unauthorized access (invalid credentials)</p>
                    <p class="text-gray-200"><strong>404:</strong> Resource not found</p>
                    <p class="text-gray-200"><strong>500:</strong> Internal server error</p>
                </div>
            </div>

            <div class="bg-gray-700 p-4 rounded-lg mt-8">
                <h2 class="text-xl font-semibold text-purple-300 mb-2">Users Schema</h2>
                <pre class="bg-gray-600 p-3 rounded mt-2 text-sm text-gray-200">
CREATE TYPE user_role AS ENUM('admin', 'team_member');
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'team_member',
    display_name VARCHAR(100),
    manager_id INT,
    FOREIGN KEY(manager_id) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

                </pre>
            </div>
        </div>
    </div>
</body>
</html>`);
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
    const { name, date, description, status, priority, owner_id } = req.body;

    if (!name || !date || !status || !priority) {
        return res.status(400).json({
            message: 'Missing required fields'

        });
    }

    // check to see if name and description is unique or not
    const checkName = await pool.query('SELECT * FROM task WHERE name = $1', [name]);
    const checkDescription = await pool.query('SELECT * FROM task WHERE description = $1', [description]);

    if (checkName.rowCount > 0) {
        return res.status(400).json({ message: 'Task name already exists' });
    }
    if (checkDescription.rowCount > 0) {
        return res.status(400).json({ message: 'Task description already exists' });
    }

    try {
        // Start transaction
        await pool.query('BEGIN');

        // Insert task
        const taskResult = await pool.query(
            `INSERT INTO task (name, date, description, status, priority, owner_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [name, date, description, status || 'pending', priority || 'medium', owner_id]
        );
        // asign the task to the owner
        const assignOwner = await pool.query(
            `INSERT INTO assignedto (user_id, task_id, assigned_date)
                VALUES ($1, $2, CURRENT_DATE)`,
            [owner_id, taskResult.rows[0].id]
        );

        // Commit transaction
        await pool.query('COMMIT');

        res.status(201).json(taskResult.rows[0]);
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({
            message: 'Failed to create task'
        });
    }
});

// DELETE /task/delete/:id - Delete a task by ID
router.delete('/delete/:id', isAuthenticated, async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
    }
    try {
        await pool.query('BEGIN');

        // Delete assignments first due to foreign key constraint
        await pool.query('DELETE FROM assignedto WHERE task_id = $1', [id]);

        // Then delete the task
        const deleteTask = await pool.query('DELETE FROM task WHERE id = $1 RETURNING *', [id]);

        if (deleteTask.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Task not found' });
        }

        await pool.query('COMMIT');
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ message: 'Failed to delete task' });
    }
});

// PUT /task/update/:id - Update a task by ID
router.put('/update/:id', isAuthenticated, async (req, res) => {
    const { id, name, date, description, status, priority } = req.body;

    try {
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

        await pool.query('COMMIT');
        res.json(taskResult.rows[0]);
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Error updating task:', err);
        res.status(500).json({ message: 'Failed to update task' });
    }
});

// GET /task/:id - Fetch a task by ID
// Should be used to get a specific task with all assigned users
router.get('/id/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
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

// GET /task/assignedto/user/:id - Fetch all tasks assigned to a user
// Should be used to get all tasks assigned to a specific user
router.get('/assignedto/user/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const result = await pool.query(`
            SELECT t.id, t.name, t.date, t.description, t.status, t.priority, t.is_locked, t.created_at,
            u.id as owner_id, u.username as owner_username, u.display_name as owner_display_name
            FROM task t
            JOIN assignedto a ON t.id = a.task_id
            JOIN users u ON t.owner_id = u.id
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

// GET /task/assignedto/all - Fetch all assignedto records
// Should be used to get all assignedto records
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

// PUT /task/lock/:id - Lock a task by ID
router.put('/lock/:id', isAuthAsAdmin, async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
    }
    try {
        const result = await pool.query(`
            UPDATE task
            SET is_locked = true
            WHERE id = $1
            RETURNING *
        `, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Failed to lock task' });
    }
});

// PUT /task/unlock/:id - Unlock a task by ID
router.put('/unlock/:id', isAuthAsAdmin, async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
    }
    try {
        const result = await pool.query(`
            UPDATE task
            SET is_locked = false
            WHERE id = $1
            RETURNING *
        `, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Failed to unlock task' });
    }
});

// POST /task/assign/:id - Assign a task to a user
router.post('/assign/:id', isAuthAsAdmin, async (req, res) => {
    const { id } = req.params;
    const { user_ids } = req.body;

    if (!id || !user_ids) {
        return res.status(400).json({ message: 'Task ID and user IDs are required' });
    }

    try {
        // Check which users are already assigned
        const checkAssigned = await pool.query(`
            SELECT user_id FROM assignedto
            WHERE task_id = $1 AND user_id = ANY($2)
        `, [id, user_ids]);

        // Get array of already assigned user IDs
        const assignedUserIds = checkAssigned.rows.map(row => row.user_id);

        // Filter out already assigned users
        const newUserIds = user_ids.filter(id => !assignedUserIds.includes(id));

        // If there are new users to assign, insert them and notified them        
        if (newUserIds.length > 0) {
            const assignValues = newUserIds.map(userId => {
                return `(${userId}, ${id}, CURRENT_DATE)`;
            }).join(',');

            await pool.query(`
                INSERT INTO AssignedTo (user_id, task_id, assigned_date)
                VALUES ${assignValues}
            `);

        }

        res.status(201).json({
            message: 'Assignment process completed'
        });

    } catch (err) {
        res.status(500).json({ message: 'Failed to assign task' });
    }
});

// DELETE /task/unassign/:id - Unassign a task from a user
router.delete('/unassign/:id', isAuthAsAdmin, async (req, res) => {
    const { id } = req.params;
    const { user_ids } = req.body;

    if (!id || !user_ids) {
        return res.status(400).json({ message: 'Task ID and user IDs are required' });
    }

    try {
        const result = await pool.query(`
            DELETE FROM assignedto
            WHERE task_id = $1 AND user_id = ANY($2)
            RETURNING *
        `, [id, user_ids]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'No assignments found' });
        }

        res.status(200).json({ message: 'Unassignment process completed' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to unassign task' });
    }
});

// new route for fetching all tasks under a user that is under some manager
// GET /task/assignedto/manager/:id - Fetch all tasks assigned to users under a manager
router.get('/assignedto/manager/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Manager ID is required and must be a number' });
    }

    try {
        const result = await pool.query(`
            SELECT 
                t.*,
                u.id as assigned_user_id,
                u.username as assigned_username,
                u.display_name as assigned_display_name,
                o.id as owner_id,
                o.username as owner_username,
                o.display_name as owner_display_name
            FROM users u
            JOIN assignedto a ON u.id = a.user_id
            JOIN task t ON a.task_id = t.id
            JOIN users o ON t.owner_id = o.id
            WHERE u.manager_id = $1
            ORDER BY u.display_name, t.date DESC
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'No tasks found for team members under this manager' });
        }
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching manager tasks:', err);
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
});

module.exports = router;

