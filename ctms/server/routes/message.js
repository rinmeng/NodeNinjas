const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import database connection

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