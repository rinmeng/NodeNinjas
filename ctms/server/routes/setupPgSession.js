const express = require('express');
const pool = require('../db');
const router = express.Router();

async function setupPgSession() {
    // The postgre database may not be ready to accept connections yet, so we will retry a few times with 
    // a delay before giving up.
    let retries = 5;
    while (retries) {
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
            console.log("Session table created successfully");
            return { message: "Session table created successfully" };
        } catch (err) {
            console.error(`Error setting up session table, postgresdb may not be ready to take connections yet... (retries left: ${retries}): ${err.message}`);
            retries -= 1;
            if (retries === 0) {
                throw new Error("Failed to create session table: " + err.message);
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

module.exports = setupPgSession;