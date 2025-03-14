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
