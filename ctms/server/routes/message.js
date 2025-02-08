const express = require('express');
const pool = require('../db');
const router = express.Router();
const { isAuthenticated } = require('../auth');
const { isAuthAsAdmin } = require('../auth');

// GET /message/ (documentation endpoint implemented separately)
router.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Message Endpoint Documentation</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.2/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50 min-h-screen p-8">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-6">Message Endpoint Documentation</h1>
            
            <div class="space-y-8">
                <!-- Authentication Note -->
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h2 class="text-xl font-semibold text-blue-800 mb-2">Authentication</h2>
                    <p class="text-blue-700">All message endpoints require authentication via <code class="bg-blue-100 px-1 rounded">isAuthenticated</code> middleware.</p>
                </div>

                <!-- Endpoints Section -->
                <div class="space-y-6">
                    <!-- GET /message/all -->
                    <div class="border-l-4 border-green-500 pl-4">
                        <h3 class="text-xl font-semibold text-gray-800">GET /message/all</h3>
                        <p class="text-gray-600 mt-2">Retrieves all messages for the current user, including messages from assigned tasks.</p>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Response:</h4>
                            <pre class="bg-gray-50 p-3 rounded mt-2 text-sm">
{
    "id": number,
    "message": string,
    "sent_at": timestamp,
    "sender": {
        "id": number,
        "username": string,
        "display_name": string
    },
    "task": {
        "id": number,
        "name": string
    }
}[]
                            </pre>
                        </div>
                    </div>

                    <!-- POST /message/send -->
                    <div class="border-l-4 border-blue-500 pl-4">
                        <h3 class="text-xl font-semibold text-gray-800">POST /message/send</h3>
                        <p class="text-gray-600 mt-2">Sends a new message, optionally associated with a task.</p>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Request Body:</h4>
                            <pre class="bg-gray-50 p-3 rounded mt-2 text-sm">
{
    "message": string,
    "task_id": number?  // Optional task association
}
                            </pre>
                        </div>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Response:</h4>
                            <pre class="bg-gray-50 p-3 rounded mt-2 text-sm">
{
    "id": number,
    "message": string,
    "user_id": number,
    "task_id": number?,
    "sent_at": timestamp
}
                            </pre>
                        </div>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Notes:</h4>
                            <ul class="list-disc ml-5 text-gray-600">
                                <li>If task_id is provided, notifications will be sent to all users assigned to that task</li>
                                <li>The sender will not receive a notification for their own message</li>
                            </ul>
                        </div>
                    </div>

                    <!-- GET /message/task/:taskId -->
                    <div class="border-l-4 border-green-500 pl-4">
                        <h3 class="text-xl font-semibold text-gray-800">GET /message/task/:taskId</h3>
                        <p class="text-gray-600 mt-2">Retrieves all messages for a specific task.</p>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Parameters:</h4>
                            <p class="text-gray-600"><code class="bg-gray-100 px-1 rounded">taskId</code> - Task ID (number)</p>
                        </div>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Response:</h4>
                            <pre class="bg-gray-50 p-3 rounded mt-2 text-sm">
{
    "id": number,
    "message": string,
    "sent_at": timestamp,
    "sender": {
        "id": number,
        "username": string,
        "display_name": string
    }
}[]
                            </pre>
                        </div>
                    </div>

                    <!-- DELETE /message/:id -->
                    <div class="border-l-4 border-red-500 pl-4">
                        <h3 class="text-xl font-semibold text-gray-800">DELETE /message/:id</h3>
                        <p class="text-gray-600 mt-2">Deletes a specific message.</p>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Parameters:</h4>
                            <p class="text-gray-600"><code class="bg-gray-100 px-1 rounded">id</code> - Message ID (number)</p>
                        </div>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Response:</h4>
                            <pre class="bg-gray-50 p-3 rounded mt-2 text-sm">
{
    "message": "Message deleted successfully"
}
                            </pre>
                        </div>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Notes:</h4>
                            <p class="text-gray-600">Only the original sender can delete their messages</p>
                        </div>
                    </div>
                </div>

                <!-- Error Handling -->
                <div class="bg-yellow-50 p-4 rounded-lg mt-8">
                    <h2 class="text-xl font-semibold text-yellow-800 mb-2">Error Responses</h2>
                    <div class="space-y-2">
                        <p class="text-yellow-700"><strong>404:</strong> Message not found or unauthorized</p>
                        <p class="text-yellow-700"><strong>401:</strong> Unauthorized access</p>
                        <p class="text-yellow-700"><strong>500:</strong> Internal server error</p>
                    </div>
                    <p class="text-yellow-700 mt-4">Note: All error responses follow the format: <code class="bg-yellow-100 px-1 rounded">{ "message": string }</code></p>
                </div>

                <!-- Additional Notes -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h2 class="text-xl font-semibold text-gray-800 mb-2">Additional Notes</h2>
                    <ul class="list-disc ml-5 text-gray-600">
                        <li>All message lists are ordered by sent_at timestamp (newest first)</li>
                        <li>Task-related messages automatically generate notifications for assigned users</li>
                        <li>Messages can be associated with tasks but this is optional</li>
                        <li>Users can see messages from tasks they're assigned to, even if they didn't send them</li>
                    </ul>
                </div>
            </div>
        </div>
    </body>
    </html>`);
});

// GET /message/all - Get all messages for a user
router.get('/all', isAuthenticated, async (req, res) => {
    if (!req.session.user) { // If the user is not authenticated
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const result = await pool.query(`
            SELECT m.*, 
                   json_build_object(
                       'id', u.id,
                       'username', u.username,
                       'display_name', u.display_name
                   ) as sender,
                   json_build_object(
                       'id', t.id,
                       'name', t.name
                   ) as task
            FROM messages m
            JOIN users u ON m.user_id = u.id
            LEFT JOIN task t ON m.task_id = t.id
            WHERE m.user_id = $1 OR t.id IN (
                SELECT task_id FROM assignedto WHERE user_id = $1
            )
            ORDER BY m.sent_at DESC
        `, [req.session.userId]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve messages' });
    }
});

// POST /message/send - Send a new message
router.post('/send', isAuthenticated, async (req, res) => {
    const { message, task_id } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO messages (message, user_id, task_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [message, req.session.userId, task_id]
        );

        // If this is a task message, notify all assigned users
        if (task_id) {
            const assignedUsers = await pool.query(
                `SELECT user_id FROM assignedto WHERE task_id = $1`,
                [task_id]
            );

            // Create notifications for all assigned users except sender
            const notifications = assignedUsers.rows
                .filter(user => user.user_id !== req.session.userId)
                .map(user => ({
                    user_id: user.user_id,
                    message: `New message in task discussion`,
                    type: 'message_received'
                }));

            if (notifications.length > 0) {
                await pool.query(
                    `INSERT INTO notifications (user_id, message, type)
                     VALUES ${notifications.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(', ')}`,
                    notifications.flatMap(n => [n.user_id, n.message, n.type])
                );
            }
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// GET /message/task/:taskId - Get messages for a specific task
router.get('/task/:taskId', isAuthenticated, async (req, res) => {
    const { taskId } = req.params;

    try {
        const result = await pool.query(`
            SELECT m.*, 
                   json_build_object(
                       'id', u.id,
                       'username', u.username,
                       'display_name', u.display_name
                   ) as sender
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.task_id = $1
            ORDER BY m.sent_at DESC
        `, [taskId]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve task messages' });
    }
});

// DELETE /message/:id - Delete a message
router.delete('/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM messages WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Message not found or unauthorized' });
        }

        res.json({ message: 'Message deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete message' });
    }
});

module.exports = router;