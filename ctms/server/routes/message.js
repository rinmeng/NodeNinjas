const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import database connection

// GET /message (documentation)
router.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message Endpoint Documentation</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.2/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 min-h-screen p-8">
    <div class="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-100 mb-6">Message Endpoint Documentation</h1>
        
        <div class="space-y-8">
            <!-- Endpoints Section -->
            <div class="space-y-6">
                <!-- POST /message -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">POST /message</h3>
                    <p class="text-gray-300 mt-2">Send a message from one user to another.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "sender_id": number,     // Required - User ID of sender
    "recipient_id": number,  // Required - User ID of recipient
    "text": string           // Required - Message content
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "sender_id": number,
    "recipient_id": number,
    "task_id": number|null,
    "text": string,
    "sent_at": timestamp
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Notes:</h4>
                        <ul class="list-disc ml-5 text-gray-300">
                            <li>Triggers real-time WebSocket notifications for both sender and recipient</li>
                            <li>Message timestamp is automatically set by the server</li>
                        </ul>
                    </div>
                </div>

                <!-- GET /message/:sender_id/:recipient_id -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /message/:sender_id/:recipient_id</h3>
                    <p class="text-gray-300 mt-2">Retrieve conversation history between two users.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">sender_id</code> - First user ID (number)</p>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">recipient_id</code> - Second user ID (number)</p>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
[
    {
        "id": number,
        "sender_id": number,
        "recipient_id": number,
        "task_id": number|null,
        "text": string,
        "sent_at": timestamp
    }
]
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Notes:</h4>
                        <ul class="list-disc ml-5 text-gray-300">
                            <li>Returns messages in both directions between the specified users</li>
                            <li>Results are ordered chronologically (oldest first)</li>
                            <li>Returns an empty array if no messages exist</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Error Handling -->
            <div class="bg-gray-700 p-4 rounded-lg mt-8">
                <h2 class="text-xl font-semibold text-yellow-300 mb-2">Error Responses</h2>
                <div class="space-y-2">
                    <p class="text-gray-200"><strong>400:</strong> Bad request (missing required fields)</p>
                    <p class="text-gray-200"><strong>500:</strong> Internal server error</p>
                </div>
                <div class="mt-4">
                    <h3 class="font-medium text-gray-200">Common Error Messages:</h3>
                    <ul class="list-disc ml-5 text-gray-300">
                        <li>"All fields are required."</li>
                        <li>"Failed to send message."</li>
                        <li>"Failed to retrieve messages."</li>
                    </ul>
                </div>
            </div>

            <!-- WebSocket Events -->
            <div class="bg-gray-700 p-4 rounded-lg mt-8">
                <h2 class="text-xl font-semibold text-green-300 mb-2">WebSocket Events</h2>
                <div class="space-y-3">
                    <div>
                        <h3 class="font-medium text-gray-200">refetchMessages</h3>
                        <p class="text-gray-300 mt-1">Emitted when a new message is created. The client should use this event to refresh its message list.</p>
                        <pre class="bg-gray-600 p-3 rounded mt-2 text-sm text-gray-200">
{
    "conversationId": string,  // Format: "userId-partnerId"
    "partnerId": number        // The user ID of the other conversation participant
}
                        </pre>
                    </div>
                </div>
            </div>

            <!-- Database Schema -->
            <div class="bg-gray-700 p-4 rounded-lg mt-8">
                <h2 class="text-xl font-semibold text-purple-300 mb-2">Messages Schema</h2>
                <pre class="bg-gray-600 p-3 rounded mt-2 text-sm text-gray-200">
DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
    id SERIAL PRIMARY KEY, -- Unique message ID
    sender_id INT NOT NULL,
    recipient_id INT,
    task_id INT,
    text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE SET NULL
);

-- Indexes for faster lookups
CREATE INDEX idx_messages_sender_id ON messages (sender_id);
CREATE INDEX idx_messages_recipient_id ON messages (recipient_id);
CREATE INDEX idx_messages_task_id ON messages (task_id);
                </pre>
            </div>
        </div>
    </div>
</body>
</html>`);
});

//  Send a message
router.post("/", async (req, res) => {
  const { sender_id, recipient_id, text } = req.body; // Use correct column names

  if (!sender_id || !recipient_id || !text.trim()) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, text) 
       VALUES ($1, $2, $3) RETURNING *`,
      [sender_id, recipient_id, text]
    );

    const io = req.app.get('io');

    // Emit to sender's room
    io.to(`user_${sender_id}`).emit('refetchMessages', {
      conversationId: `${sender_id}-${recipient_id}`,
      partnerId: recipient_id
    });

    // Emit to recipient's room
    io.to(`user_${recipient_id}`).emit('refetchMessages', {
      conversationId: `${recipient_id}-${sender_id}`,
      partnerId: sender_id
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});

//  Get messages between two users
router.get("/:sender_id/:recipient_id", async (req, res) => {
  const { sender_id, recipient_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND recipient_id = $2) 
          OR (sender_id = $2 AND recipient_id = $1)
       ORDER BY sent_at ASC`,
      [sender_id, recipient_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to retrieve messages." });
  }
});

module.exports = router;