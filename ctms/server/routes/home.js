const express = require("express");
const pool = require("../db"); // Database connection
const router = express.Router();

router.get("/", (req, res) => {
  res.redirect(`/setup`);
});

module.exports = router;
