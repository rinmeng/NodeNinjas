const express = require('express');
const router = express.Router();
const pool = require('../db'); // Import your database connection pool

// Fetch message history between two users
router.get('/history/:userId1/:userId2', async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND recipient_id = $2) 
       OR (sender_id = $2 AND recipient_id = $1) 
       ORDER BY sent_at ASC`,
      [userId1, userId2]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching message history:', err);
    res.status(500).json({ error: 'Failed to fetch message history' });
  }
});

// Save a message to the database
router.post('/save', async (req, res) => {
  const { sender_id, recipient_id, text } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, text, sent_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING *`,
      [sender_id, recipient_id, text]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

module.exports = router;