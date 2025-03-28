const express = require('express');
const pool = require('../db');
const router = express.Router();
const { isAuthenticated } = require('../auth');

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