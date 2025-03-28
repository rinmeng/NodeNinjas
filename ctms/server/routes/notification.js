const express = require('express');
const pool = require('../db');
const router = express.Router();
const { isAuthenticated } = require('../auth');

// GET /notification (documentation)
router.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification Endpoint Documentation</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.2/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 min-h-screen p-8">
    <div class="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-100 mb-6">Notification Endpoint Documentation</h1>
        
        <div class="space-y-8">
            <!-- Authentication Note -->
            <div class="bg-gray-700 p-4 rounded-lg">
                <h2 class="text-xl font-semibold text-blue-300 mb-2">Authentication</h2>
                <p class="text-gray-200">Most endpoints require authentication. Notification routes are protected by <code class="bg-gray-600 px-1 rounded">isAuthenticated</code> middleware.</p>
            </div>

            <!-- Endpoints Section -->
            <div class="space-y-6">
                <!-- POST /notification/add/:ids -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">POST /notification/add/:ids</h3>
                    <p class="text-gray-300 mt-2">Creates new notifications for multiple users at once.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "message": string,       // Required - Notification message
    "user_ids": number[],    // Required - Array of user IDs to notify
    "type": string           // Required - Notification type
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "message": "Notification added successfully"
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Notes:</h4>
                        <ul class="list-disc ml-5 text-gray-300">
                            <li>Uses PostgreSQL's unnest function to efficiently create multiple notifications</li>
                            <li>All notifications are created with 'unread' status by default</li>
                        </ul>
                    </div>
                </div>

                <!-- GET /notification/get/all/:user_id -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /notification/get/all/:user_id</h3>
                    <p class="text-gray-300 mt-2">Retrieves all notifications for a specific user.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">user_id</code> - User ID (number)</p>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
[
    {
        "id": number,
        "message": string,
        "user_id": number,
        "type": string,
        "status": string,
        "created_at": timestamp
    }
]
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Notes:</h4>
                        <ul class="list-disc ml-5 text-gray-300">
                            <li>Notifications are ordered by creation date (newest first)</li>
                            <li>Returns an empty array if no notifications exist</li>
                        </ul>
                    </div>
                </div>

                <!-- PUT /notification/read/:id -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">PUT /notification/read/:id</h3>
                    <p class="text-gray-300 mt-2">Marks a notification as read.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">id</code> - Notification ID (number)</p>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "message": string,
    "user_id": number,
    "type": string,
    "status": "read",
    "created_at": timestamp
}
                        </pre>
                    </div>
                </div>

                <!-- PUT /notification/unread/:id -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">PUT /notification/unread/:id</h3>
                    <p class="text-gray-300 mt-2">Marks a notification as unread.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">id</code> - Notification ID (number)</p>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "message": string,
    "user_id": number,
    "type": string,
    "status": "unread",
    "created_at": timestamp
}
                        </pre>
                    </div>
                </div>

                <!-- DELETE /notification/delete/:id -->
                <div class="border-l-4 border-red-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">DELETE /notification/delete/:id</h3>
                    <p class="text-gray-300 mt-2">Deletes a notification by its ID.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">id</code> - Notification ID (number)</p>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "message": string,
    "user_id": number,
    "type": string,
    "status": string,
    "created_at": timestamp
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
                    <p class="text-gray-200"><strong>401:</strong> Unauthorized access (not authenticated)</p>
                    <p class="text-gray-200"><strong>404:</strong> Resource not found</p>
                    <p class="text-gray-200"><strong>500:</strong> Internal server error</p>
                </div>
                <div class="mt-4">
                    <h3 class="font-medium text-gray-200">Common Error Messages:</h3>
                    <ul class="list-disc ml-5 text-gray-300">
                        <li>"Please enter all required fields"</li>
                        <li>"Notification not found"</li>
                        <li>"Failed to add notification"</li>
                        <li>"Failed to fetch notifications"</li>
                        <li>"Failed to update notification"</li>
                        <li>"Failed to delete notification"</li>
                    </ul>
                </div>
            </div>

            <!-- Database Schema -->
            <div class="bg-gray-700 p-4 rounded-lg mt-8">
                <h2 class="text-xl font-semibold text-purple-300 mb-2">Notification Schema</h2>
                <pre class="bg-gray-600 p-3 rounded mt-2 text-sm text-gray-200">
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN 
    ('message', 'task_assignment', 'alert', 'task_update', 'task_unassignment')),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
-- Indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_status ON notifications (user_id, status);
                </pre>
            </div>
        </div>
    </div>
</body>
</html>`);
});

// post a notification
router.post('/add/:ids', isAuthenticated, async (req, res) => {
    const { message, user_ids, type } = req.body;
    if (!message || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({ message: 'Please enter all required fields' });
    }

    try {
        // Using unnest to convert the array to a set of rows
        const query = `
            INSERT INTO notifications (message, user_id, type)
            SELECT $1, unnest($2::int[]), $3
            RETURNING *
        `;

        await pool.query(query, [message, user_ids, type]);

        res.status(201).json({ message: 'Notification added successfully' });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Failed to add notification' });
    }
});

// GET /notification under the user-id
router.get('/get/all/:user_id', isAuthenticated, async (req, res) => {
    const user_id = req.params.user_id;
    try {
        const notification = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);

        res.status(200).json(notification.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Failed to fetch notifications' });

    }

});

// PUT /notification/read/:id
router.put('/read/:id', isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
        const notification = await pool.query("UPDATE notifications SET status = 'read' WHERE id = $1 RETURNING *", [id]);

        if (notification.rows.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Failed to update notification' });
    }
});

// PUT /notification/unread/:id
router.put('/unread/:id', isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
        const notification = await pool.query("UPDATE notifications SET status = 'unread' WHERE id = $1 RETURNING *", [id]);

        if (notification.rows.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Failed to update notification' });
    }
}
);
// DELETE /notification/delete/:id
router.delete('/delete/:id', isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
        const notification = await pool.query("DELETE FROM notifications WHERE id = $1 RETURNING *", [id]);

        if (notification.rows.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
});


module.exports = router;