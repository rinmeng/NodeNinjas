const express = require('express');
const pool = require('../db'); // Access the database connection
const router = express.Router();

router.get('/', (req, res) => {
    res.send(`
        <h1>Visit 
        <br> /user to access the user endpoint
        <br> /task to access the task endpoint
        <br> /setup to setup the database
        </h1>
        `);
});

module.exports = router;
