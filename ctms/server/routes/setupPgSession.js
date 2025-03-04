const express = require('express');
const pool = require('../db');
const router = express.Router();

async function setupPgSession() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS user_sessions CASCADE;`);
        await pool.query(`
            CREATE TABLE user_sessions (
                sid VARCHAR(100) PRIMARY KEY,
                sess JSON NOT NULL,
                expire TIMESTAMP(6) NOT NULL
            );
        `);
        return { message: "Session table created successfully" };
    } catch (err) {
        console.error("Error setting up session table:", err.message);
        throw new Error("Failed to create session table: " + err.message);
    }
}

module.exports = setupPgSession;
