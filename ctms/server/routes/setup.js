const express = require('express');
const pool = require('../db');
const router = express.Router();

async function setupPgSession() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS user_sessions CASCADE;
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

async function setupAssignedTo() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS AssignedTo CASCADE;
            CREATE TABLE AssignedTo (
                id SERIAL PRIMARY KEY,
                assigned_date DATE NOT NULL,
                user_id INT NOT NULL,
                task_id INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (task_id) REFERENCES Task (id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_assignedto_user_id ON AssignedTo (user_id);
            CREATE INDEX idx_assignedto_task_id ON AssignedTo (task_id);
        `);
        return { message: "AssignedTo table created successfully" };
    } catch (err) {
        console.error("Error setting up AssignedTo table:", err.message);
        throw new Error("Failed to create AssignedTo table: " + err.message);
    }
}

async function setupTasks() {
    try {
        await pool.query(`
            DROP TYPE IF EXISTS task_status CASCADE;
            DROP TYPE IF EXISTS task_priority CASCADE;
            CREATE TYPE task_status AS ENUM('pending', 'in_progress', 'completed');
            CREATE TYPE task_priority AS ENUM('low', 'medium', 'high');
            DROP TABLE IF EXISTS Task CASCADE;
            CREATE TABLE Task(
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                status task_status NOT NULL DEFAULT 'pending',
                priority task_priority NOT NULL DEFAULT 'medium',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        return { message: "Task table created successfully" };
    } catch (err) {
        console.error("Error setting up task table:", err.message);
        throw new Error("Failed to create Task table: " + err.message);
    }
}

async function setupMessages() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS messages CASCADE;
            CREATE TABLE messages (
                id SERIAL PRIMARY KEY,
                message TEXT NOT NULL,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_id INT NOT NULL,
                task_id INT,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (task_id) REFERENCES Task (id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_messages_user_id ON messages (user_id);
            CREATE INDEX idx_messages_task_id ON messages (task_id);
        `);
        return { message: "Messages table created successfully" };
    } catch (err) {
        console.error("Error setting up messages table:", err.message);
        throw new Error("Failed to create Messages table: " + err.message);
    }
}

async function setupNotifications() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS notifications CASCADE;
            CREATE TABLE notifications (
                id SERIAL PRIMARY KEY,
                message TEXT NOT NULL,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'unread',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );
            CREATE INDEX idx_notifications_user_id ON notifications (user_id);
        `);
        return { message: "Notifications table created successfully" };
    } catch (err) {
        console.error("Error setting up notifications table:", err.message);
        throw new Error("Failed to create Notifications table: " + err.message);
    }
}

async function setupUsers() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS users CASCADE;
            DROP TYPE IF EXISTS user_role CASCADE;
            CREATE TYPE user_role AS ENUM('admin', 'team_member');
            CREATE TABLE users(
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role user_role NOT NULL DEFAULT 'team_member',
                display_name VARCHAR(100),
                manager_id INT,
                FOREIGN KEY(manager_id) REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_users_username ON users(username);
            CREATE INDEX idx_users_email ON users(email);
            CREATE INDEX idx_users_role ON users(role);
        `);

        const adminUsers = [
            { username: 'rin', email: 'rin@example.com', password: 'rin', display_name: 'Rin', manager_id: 1 },
            { username: 'enock', email: 'enock@example.com', password: 'enock', display_name: 'Enock', manager_id: 2 },
            { username: 'keeran', email: 'keeran@example.com', password: 'keeran', display_name: 'Keeran', manager_id: 3 },
            { username: 'madiba', email: 'madiba@example.com', password: 'madiba', display_name: 'Madiba', manager_id: 4 },
            { username: 'mason', email: 'mason@example.com', password: 'mason', display_name: 'Mason', manager_id: 5 },
        ];

        for (const user of adminUsers) {
            await pool.query(`
                INSERT INTO users(username, email, password_hash, role, display_name, manager_id)
                VALUES($1, $2, $3, 'admin', $4, $5)`,
                [user.username, user.email, user.password, user.display_name, user.manager_id]
            );
        }

        await pool.query(`
            INSERT INTO users(username, email, password_hash, role, display_name, manager_id)
            VALUES($1, $2, $3, 'team_member', $4, $5)`,
            ['arnold', 'arnold@example.com', 'arnold', 'Arnold', 1]
        );

        return { message: "Users table created and populated successfully" };
    } catch (err) {
        console.error("Error setting up users table:", err.message);
        throw new Error("Failed to create Users table: " + err.message);
    }
}

async function resetAllTables() {
    try {
        // Use a transaction to ensure all operations complete or none do
        await pool.query('BEGIN');

        try {
            // Truncate all tables in correct order
            await pool.query(`
                -- First disable foreign key constraints
                SET CONSTRAINTS ALL DEFERRED;
                
                -- Truncate all tables
                TRUNCATE TABLE notifications, messages, AssignedTo, Task, user_sessions, users CASCADE;
                
                -- Re-enable constraints
                SET CONSTRAINTS ALL IMMEDIATE;
            `);

            await pool.query('COMMIT');
            return { message: "All tables cleared successfully" };

        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }
    } catch (err) {
        console.error("Error clearing tables:", err.message);
        throw new Error("Failed to clear tables: " + err.message);
    }
}

async function deleteAllTables() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS notifications CASCADE;
            DROP TABLE IF EXISTS messages CASCADE;
            DROP TABLE IF EXISTS AssignedTo CASCADE;
            DROP TABLE IF EXISTS Task CASCADE;
            DROP TABLE IF EXISTS user_sessions CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            
            DROP TYPE IF EXISTS user_role CASCADE;
            DROP TYPE IF EXISTS task_status CASCADE;
            DROP TYPE IF EXISTS task_priority CASCADE;
        `);
        return { message: "All tables deleted successfully" };
    } catch (err) {
        console.error("Error deleting tables:", err.message);
        throw new Error("Failed to delete tables: " + err.message);
    }
}

// Setup all tables
router.get('/', async (req, res) => {
    try {
        await deleteAllTables();
        const users = await setupUsers();
        const session = await setupPgSession();
        const tasks = await setupTasks();
        const messages = await setupMessages();
        const notifications = await setupNotifications();
        const assignedTo = await setupAssignedTo();

        res.status(200).json({ message: "All tables created successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

router.get('/reset', async (req, res) => {
    try {
        const result = await resetAllTables();
        res.status(200).json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});


// Delete all tables
router.get('/delete', async (req, res) => {
    try {
        const result = await deleteAllTables();
        res.status(200).json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;