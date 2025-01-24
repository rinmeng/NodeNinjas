const express = require('express');
const router = express.Router();

// GET /api
router.get('/', (req, res) => {
    res.json({ users: ["user1", "user2", "user3", "user4", "user5"] });
});

module.exports = router;
