const express = require("express");
const pool = require("../db"); // Database connection
const router = express.Router();
const proxy = "http://localhost:13000";

router.get("/", (req, res) => {
  res.redirect(`${proxy}/docs`);
});

module.exports = router;
