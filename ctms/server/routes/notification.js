const express = require('express');
const pool = require('../db');
const router = express.Router();
const { isAuthenticated } = require('../auth');

// GET /notification/ (documentation endpoint implemented separately)
router.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notification Endpoint Documentation</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.2/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50 min-h-screen p-8">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-6">Notification Endpoint Documentation</h1>
            
            <div class="space-y-8">
                <!-- Authentication Note -->
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h2 class="text-xl font-semibold text-blue-800 mb-2">Authentication</h2>
                    <p class="text-blue-700">All notification endpoints require authentication via <code class="bg-blue-100 px-1 rounded">isAuthenticated</code> middleware.</p>
                </div>

                <!-- Endpoints Section -->
                <div class="space-y-6">
                    <!-- GET /notification/all -->
                    <div class="border-l-4 border-green-500 pl-4">
                        <h3 class="text-xl font-semibold text-gray-800">GET /notification/all</h3>
                        <p class="text-gray-600 mt-2">Retrieves all notifications for the current user.</p>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Response:</h4>
                            <pre class="bg-gray-50 p-3 rounded mt-2 text-sm">
{
    "id": number,
    "user_id": number,
    "message": string,
    "type": string,
    "status": "read" | "unread",
    "created_at": timestamp,
    "updated_at": timestamp
}[]
                            </pre>
                        </div>
                    </div>

                    <!-- PUT /notification/read/:id -->
                    <div class="border-l-4 border-yellow-500 pl-4">
                        <h3 class="text-xl font-semibold text-gray-800">PUT /notification/read/:id</h3>
                        <p class="text-gray-600 mt-2">Marks a specific notification as read.</p>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Parameters:</h4>
                            <p class="text-gray-600"><code class="bg-gray-100 px-1 rounded">id</code> - Notification ID (number)</p>
                        </div>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Response:</h4>
                            <pre class="bg-gray-50 p-3 rounded mt-2 text-sm">
{
    "id": number,
    "user_id": number,
    "message": string,
    "type": string,
    "status": "read",
    "created_at": timestamp,
    "updated_at": timestamp
}
                            </pre>
                        </div>
                    </div>

                    <!-- PUT /notification/read-all -->
                    <div class="border-l-4 border-yellow-500 pl-4">
                        <h3 class="text-xl font-semibold text-gray-800">PUT /notification/read-all</h3>
                        <p class="text-gray-600 mt-2">Marks all unread notifications as read for the current user.</p>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Response:</h4>
                            <pre class="bg-gray-50 p-3 rounded mt-2 text-sm">
{
    "message": "All notifications marked as read"
}
                            </pre>
                        </div>
                    </div>

                    <!-- DELETE /notification/:id -->
                    <div class="border-l-4 border-red-500 pl-4">
                        <h3 class="text-xl font-semibold text-gray-800">DELETE /notification/:id</h3>
                        <p class="text-gray-600 mt-2">Deletes a specific notification.</p>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Parameters:</h4>
                            <p class="text-gray-600"><code class="bg-gray-100 px-1 rounded">id</code> - Notification ID (number)</p>
                        </div>
                        <div class="mt-3">
                            <h4 class="font-medium text-gray-700">Response:</h4>
                            <pre class="bg-gray-50 p-3 rounded mt-2 text-sm">
{
    "message": "Notification deleted successfully"
}
                            </pre>
                        </div>
                    </div>
                </div>

                <!-- Error Handling -->
                <div class="bg-yellow-50 p-4 rounded-lg mt-8">
                    <h2 class="text-xl font-semibold text-yellow-800 mb-2">Error Responses</h2>
                    <div class="space-y-2">
                        <p class="text-yellow-700"><strong>404:</strong> Notification not found or unauthorized</p>
                        <p class="text-yellow-700"><strong>401:</strong> Unauthorized access</p>
                        <p class="text-yellow-700"><strong>500:</strong> Internal server error</p>
                    </div>
                    <p class="text-yellow-700 mt-4">Note: All error responses follow the format: <code class="bg-yellow-100 px-1 rounded">{ "message": string }</code></p>
                </div>

                <!-- Additional Notes -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h2 class="text-xl font-semibold text-gray-800 mb-2">Additional Notes</h2>
                    <ul class="list-disc ml-5 text-gray-600">
                        <li>Notifications are ordered by creation date (newest first)</li>
                        <li>Only the owner of a notification can mark it as read or delete it</li>
                        <li>The read-all endpoint only affects unread notifications</li>
                    </ul>
                </div>
            </div>
        </div>
    </body>
    </html>`);
});

// GET /notification/all - Get all notifications for current user
router.get('/all', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [req.session.userId]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve notifications' });
    }
});

// PUT /notification/read/:id - Mark notification as read
router.put('/read/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            UPDATE notifications
            SET status = 'read',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `, [id, req.session.userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Notification not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
});

// PUT /notification/read-all - Mark all notifications as read
router.put('/read-all', isAuthenticated, async (req, res) => {
    try {
        await pool.query(`
            UPDATE notifications
            SET status = 'read',
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND status = 'unread'
        `, [req.session.userId]);

        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to mark notifications as read' });
    }
});

// DELETE /notification/:id - Delete a notification
router.delete('/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Notification not found or unauthorized' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete notification' });
    }
});

module.exports = router;