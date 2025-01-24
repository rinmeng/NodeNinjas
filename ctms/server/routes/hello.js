const express = require('express');
const router = express.Router();

// create a hello json
router.get('/', (req, res) => {
    res.json({ hello: "world!" });
});

module.exports = router;
