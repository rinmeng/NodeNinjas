const express = require('express');
const pool = require('../db');
const router = express.Router();
const { isAuthenticated } = require('../auth');

//post a notification
router.post('/add/:ids', isAuthenticated, async (req, res) => {
    const { message, user_ids } = req.body;
    if (!message || !user_ids) {
        return res.status(400).json({ message: 'Please enter all required fields' });
    }
    try {
        for (const user_id of user_ids) {
            await pool.query(`INSERT INTO notifications (message,user_id) VALUES($1,$2) RETURNING *`, [message, user_id]);
        }
        res.status(201).json({ message: 'Notificaion added successfully' });
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

module.exports = router;