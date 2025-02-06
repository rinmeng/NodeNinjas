const express = require('express');
const pool = require('../db'); // Access the database connection
const router = express.Router();

// async function initpgSession() {
// try {
//     await pool.query(`
//         DROP TABLE IF EXISTS user_sessions;
//         CREATE TABLE IF NOT EXISTS user_sessions (
//             sid varchar NOT NULL COLLATE "default",
//             sess json NOT NULL,
//             expire timestamp(6) NOT NULL,
//             CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
//         );
//         CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON user_sessions ("expire");
//     `);
//     return { message: "Session table created successfully" };
// } catch (err) {
//     console.error("Error setting up session table:", err.message);
//     throw err;
// }
// }

async function setupUsers() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS users;
            DROP TYPE IF EXISTS user_role;
            CREATE TYPE user_role AS ENUM ('admin', 'team_member');

            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role user_role NOT NULL DEFAULT 'team_member',
                display_name VARCHAR(100)
            );

            -- Create indexes for common search operations
            CREATE INDEX idx_users_username ON users (username);
            CREATE INDEX idx_users_email ON users (email);
            CREATE INDEX idx_users_role ON users (role);
        `);

        // Add users with admin role
        const adminUsers = [
            { username: 'rin', email: 'rin@example.com', password: 'rin', display_name: 'Rin' },
            { username: 'enock', email: 'enock@example.com', password: 'enock', display_name: 'Enock' },
            { username: 'keeran', email: 'keeran@example.com', password: 'keeran', display_name: 'Keeran' },
            { username: 'madiba', email: 'madiba@example.com', password: 'madiba', display_name: 'Madiba' },
            { username: 'mason', email: 'mason@example.com', password: 'mason', display_name: 'Mason' },
        ];

        for (const user of adminUsers) {
            await pool.query(`
                INSERT INTO users (username, email, password_hash, role, display_name)
                VALUES ($1, $2, $3, 'admin', $4)
            `, [user.username, user.email, user.password, user.display_name]);
        }

        // Add Arnold with team_member role
        await pool.query(`
            INSERT INTO users (username, email, password_hash, role, display_name)
            VALUES ($1, $2, $3, 'team_member', $4)
        `, ['arnold', 'arnold@example.com', 'arnold', 'Arnold']);

        return { message: "Users table created and users added successfully" };
    } catch (err) {
        console.error("Error setting up users table:", err.message);
        throw err;
    }
}

async function resetUsers() {
    try {
        await pool.query(`
            DELETE FROM users;
        `);
        return { message: "Users table reset successfully" };
    } catch (err) {
        console.error("Error resetting users table:", err.message);
        throw err;
    }
}

async function deleteUsers() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS users;
        `);
        return { message: "Users table deleted successfully" };
    } catch (err) {
        console.error("Error deleting users table:", err.message);
        throw err;
    }
}

// GET /setup
router.get('/', async (req, res) => {
    try {
        const result = await setupUsers();
        // const session = await initpgSession();
        res.status(200).send({ result, session });
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ message: 'Error setting up tables' });
    }
});

// GET /setup/reset
router.get('/reset', async (req, res) => {
    try {
        const result = await resetUsers();
        res.status(200).send(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ message: 'Error resetting tables' });
    }
});

// GET /setup/delete
router.get('/delete', async (req, res) => {
    try {
        const result = await deleteUsers();
        res.status(200).send(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Error deleting tables' });
    }
});

module.exports = router;
