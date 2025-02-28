const express = require("express");
const router = express.Router();
const pool = require("../db"); // Ensure this correctly connects to your database

//  Send a message
router.post("/", async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;

  if (!sender_id || !receiver_id || !message.trim()) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, message) 
       VALUES ($1, $2, $3) RETURNING *`,
      [sender_id, receiver_id, message]
    );

    res.status(201).json(result.rows[0]); // Send back the inserted message
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// 🔹 Get messages between two users
router.get("/:sender_id/:receiver_id", async (req, res) => {
  const { sender_id, receiver_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY sent_at ASC`,
      [sender_id, receiver_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to retrieve messages." });
  }
});

module.exports = router;
