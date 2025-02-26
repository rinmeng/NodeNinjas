const express = require('express');
const pool = require('../db');
const router = express.Router();

const { hashPassword, verifyPassword } = require('../utils/PasswordHasher');

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
            DROP TABLE IF EXISTS assignedto CASCADE;
            CREATE TABLE assignedto (
                id SERIAL PRIMARY KEY,
                assigned_date DATE NOT NULL,
                user_id INT NOT NULL,
                task_id INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (task_id) REFERENCES Task (id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_assignedto_user_id ON assignedto (user_id);
            CREATE INDEX idx_assignedto_task_id ON assignedto (task_id);
            -- Assign tasks to users
            INSERT INTO assignedto (assigned_date, user_id, task_id) VALUES
            -- Rin's assignments (user_id: 1)
            (CURRENT_DATE, 1, 1),
            (CURRENT_DATE, 1, 7),
            (CURRENT_DATE, 1, 9),
            (CURRENT_DATE, 1, 10),

            -- Enock's assignments (user_id: 2)
            (CURRENT_DATE, 2, 2),
            (CURRENT_DATE, 2, 8),
            (CURRENT_DATE, 2, 13),
            (CURRENT_DATE, 2, 14),

            -- Keeran's assignments (user_id: 3)
            (CURRENT_DATE, 3, 3),
            (CURRENT_DATE, 3, 17),
            (CURRENT_DATE, 3, 18),
            (CURRENT_DATE, 3, 19),

            -- Madiba's assignments (user_id: 4)
            (CURRENT_DATE, 4, 4),
            (CURRENT_DATE, 4, 21),
            (CURRENT_DATE, 4, 22),
            (CURRENT_DATE, 4, 23),

            -- Mason's assignments (user_id: 5)
            (CURRENT_DATE, 5, 5),
            (CURRENT_DATE, 5, 25),
            (CURRENT_DATE, 5, 26),
            (CURRENT_DATE, 5, 27),

            -- Arnold's assignments (user_id: 6)
            (CURRENT_DATE, 6, 6),
            (CURRENT_DATE, 6, 7),  -- Added Budget Planning task
            (CURRENT_DATE, 6, 9),  -- Added Marketing Strategy task
            (CURRENT_DATE, 6, 29),
            (CURRENT_DATE, 6, 30),
            (CURRENT_DATE, 6, 31);
        `);
        return { message: "assignedto table created successfully" };
    } catch (err) {
        console.error("Error setting up assignedto table:", err.message);
        throw new Error("Failed to create assignedto table: " + err.message);
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
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                date DATE NOT NULL,
                status task_status NOT NULL DEFAULT 'pending',
                priority task_priority NOT NULL DEFAULT 'medium',
                is_locked BOOLEAN DEFAULT FALSE,
                owner_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE SET NULL,
                CONSTRAINT unique_description UNIQUE (description)
            );
            -- Create some sample tasks
            INSERT INTO Task (name, description, date, status, priority, owner_id) VALUES
            ('Quarterly Report Review', 'Review and finalize Q1 2025 financial reports', DATE '2025-03-15', 'pending', 'high', 1),
            ('Team Building Event', 'Organize virtual team building activity', DATE '2025-02-28', 'in_progress', 'medium', 2),
            ('Client Presentation', 'Prepare presentation for new client pitch', DATE '2025-02-20', 'completed', 'high', 3),
            ('Software Update', 'Deploy latest software updates to production', DATE '2025-02-25', 'pending', 'medium', 4),
            ('Documentation Review', 'Review and update API documentation', DATE '2025-03-01', 'in_progress', 'low', 5),
            ('Security Audit', 'Conduct monthly security audit', DATE '2025-02-18', 'completed', 'high', 6),
            ('Budget Planning', 'Create budget plan for Q2 2025', DATE '2025-03-20', 'pending', 'medium', 1),
            ('Training Workshop', 'Conduct new employee training workshop', DATE '2025-02-22', 'in_progress', 'low', 2);
            
            -- New Tasks (adding to existing ones)
            INSERT INTO Task (name, description, date, status, priority, owner_id) VALUES
            -- Rin's additional tasks
            ('Marketing Strategy', 'Develop Q2 marketing strategy', '2025-03-10', 'pending', 'medium', 1),
            ('Employee Reviews', 'Conduct annual employee reviews', '2025-03-25', 'in_progress', 'high', 1),
            ('Office Supply Inventory', 'Update office supply tracking system', '2025-02-28', 'completed', 'low', 1),
            ('Vendor Contract Review', 'Review and renew vendor contracts', '2025-03-15', 'in_progress', 'medium', 1),

            -- Enock's additional tasks
            ('Project Timeline', 'Create project timeline for Q2', '2025-03-05', 'completed', 'high', 2),
            ('Customer Survey', 'Analyze customer satisfaction survey results', '2025-03-12', 'pending', 'low', 2),
            ('Department Budget', 'Review department budget allocation', '2025-03-20', 'in_progress', 'medium', 2),
            ('Equipment Maintenance', 'Schedule regular equipment maintenance', '2025-02-25', 'completed', 'low', 2),

            -- Keeran's additional tasks
            ('Sales Report', 'Compile monthly sales report', '2025-03-01', 'pending', 'high', 3),
            ('Team Schedule', 'Optimize team work schedule', '2025-03-08', 'in_progress', 'medium', 3),
            ('Client Follow-up', 'Follow up with potential clients', '2025-02-28', 'completed', 'low', 3),
            ('Product Launch', 'Coordinate new product launch', '2025-03-15', 'pending', 'high', 3),

            -- Madiba's additional tasks
            ('Code Review', 'Review pull requests for new features', '2025-03-02', 'in_progress', 'high', 4),
            ('System Backup', 'Perform system backup and verification', '2025-02-25', 'completed', 'medium', 4),
            ('Bug Fixes', 'Address high-priority bug reports', '2025-03-10', 'pending', 'high', 4),
            ('Performance Testing', 'Conduct application performance tests', '2025-03-05', 'in_progress', 'low', 4),

            -- Mason's additional tasks
            ('API Updates', 'Update API endpoint documentation', '2025-03-01', 'completed', 'high', 5),
            ('User Guide', 'Create user guide for new features', '2025-03-10', 'pending', 'medium', 5),
            ('Technical Review', 'Review technical specifications', '2025-02-28', 'in_progress', 'low', 5),
            ('Documentation Template', 'Create new documentation templates', '2025-03-15', 'completed', 'medium', 5),

            -- Arnold's additional tasks
            ('Security Review', 'Review security protocols', '2025-03-05', 'pending', 'high', 6),
            ('Access Control', 'Update access control systems', '2025-03-12', 'in_progress', 'medium', 6),
            ('Vulnerability Scan', 'Run quarterly vulnerability scan', '2025-02-28', 'completed', 'low', 6),
            ('Incident Response', 'Update incident response plan', '2025-03-15', 'pending', 'high', 6);
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
            {
                username: 'rin',
                email: 'rin@example.com',
                password: await hashPassword('rin'),
                display_name: 'Rin',
                manager_id: 1
            },
            {
                username: 'enock',
                email: 'enock@example.com',
                password: await hashPassword('enock'),
                display_name: 'Enock',
                manager_id: 2
            },
            {
                username: 'keeran',
                email: 'keeran@example.com',
                password: await hashPassword('keeran'),
                display_name: 'Keeran',
                manager_id: 3
            },
            {
                username: 'madiba',
                email: 'madiba@example.com',
                password: await hashPassword('madiba'),
                display_name: 'Madiba',
                manager_id: 4
            },
            {
                username: 'mason',
                email: 'mason@example.com',
                password: await hashPassword('mason'),
                display_name: 'Mason',
                manager_id: 5
            },
        ];

        for (const user of adminUsers) {
            await pool.query(`
                INSERT INTO users(username, email, password_hash, role, display_name, manager_id)
                VALUES($1, $2, $3, 'admin', $4, $5)`,
                [user.username, user.email, user.password, user.display_name, user.manager_id]
            );
        }

        // Base team member arnold
        await pool.query(`
            INSERT INTO users(username, email, password_hash, role, display_name, manager_id)
            VALUES($1, $2, $3, 'team_member', $4, $5)`,
            ['arnold', 'arnold@example.com', await hashPassword('arnold'), 'Arnold', 1]
        );

        // Rin's team members
        await pool.query(`
            INSERT INTO users(username, email, password_hash, role, display_name, manager_id) VALUES
            ('sarah', 'sarah@example.com', $1, 'team_member', 'Sarah Chen', 1),
            ('james', 'james@example.com', $2, 'team_member', 'James Wilson', 1),
            ('luna', 'luna@example.com', $3, 'team_member', 'Luna Park', 1)
        `, [await hashPassword('sarah'), await hashPassword('james'), await hashPassword('luna')]);

        // Enock's team members
        await pool.query(`
            INSERT INTO users(username, email, password_hash, role, display_name, manager_id) VALUES
            ('zara', 'zara@example.com', $1, 'team_member', 'Zara Ahmed', 2),
            ('marcus', 'marcus@example.com', $2, 'team_member', 'Marcus Jones', 2),
            ('priya', 'priya@example.com', $3, 'team_member', 'Priya Patel', 2)
        `, [await hashPassword('zara'), await hashPassword('marcus'), await hashPassword('priya')]);

        // Keeran's team members
        await pool.query(`
            INSERT INTO users(username, email, password_hash, role, display_name, manager_id) VALUES
            ('diego', 'diego@example.com', $1, 'team_member', 'Diego Santos', 3),
            ('nina', 'nina@example.com', $2, 'team_member', 'Nina Chen', 3),
            ('alex', 'alex@example.com', $3, 'team_member', 'Alex Morgan', 3)
        `, [await hashPassword('diego'), await hashPassword('nina'), await hashPassword('alex')]);

        // Madiba's team members
        await pool.query(`
            INSERT INTO users(username, email, password_hash, role, display_name, manager_id) VALUES
            ('kai', 'kai@example.com', $1, 'team_member', 'Kai Wong', 4),
            ('sofia', 'sofia@example.com', $2, 'team_member', 'Sofia Rodriguez', 4),
            ('omar', 'omar@example.com', $3, 'team_member', 'Omar Hassan', 4)
        `, [await hashPassword('omar'), await hashPassword('sofia'), await hashPassword('kai')]);

        // Mason's team members
        await pool.query(`
            INSERT INTO users(username, email, password_hash, role, display_name, manager_id) VALUES
            ('emma', 'emma@example.com', $1, 'team_member', 'Emma Thompson', 5),
            ('raj', 'raj@example.com', $2, 'team_member', 'Raj Kumar', 5),
            ('liam', 'liam@example.com', $3, 'team_member', 'Liam O''Connor', 5)
        `, [await hashPassword('emma'), await hashPassword('raj'), await hashPassword('liam')]);

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
                TRUNCATE TABLE notifications, messages, assignedto, task, user_sessions, users CASCADE;
                
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
            DROP TABLE IF EXISTS assignedto CASCADE;
            DROP TABLE IF EXISTS task CASCADE;
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

        res.status(200).json({
            message: "All tables created successfully",
            users, session, tasks, messages, notifications, assignedTo
        });
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