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
            -- Create some sample assignments
            INSERT INTO assignedto (assigned_date, user_id, task_id) VALUES
            (DATE '2025-02-15', 1, 1),  -- Rin - Quarterly Report
            (DATE '2025-02-15', 2, 2),  -- Enock - Team Building
            (DATE '2025-02-15', 3, 3),  -- Keeran - Client Presentation
            (DATE '2025-02-15', 4, 4),  -- Madiba - Software Update
            (DATE '2025-02-15', 5, 5),  -- Mason - Documentation
            (DATE '2025-02-15', 6, 6),  -- Arnold - Security Audit
            (DATE '2025-02-15', 1, 7),  -- Rin - Budget Planning
            (DATE '2025-02-15', 2, 8);  -- Enock - Training Workshop
            
            -- Assign all tasks (including previous ones)
            INSERT INTO assignedto (assigned_date, user_id, task_id) VALUES
            -- Rin's assignments (id: 1)
            ('2025-02-15', 1, 1),   -- Existing: Quarterly Report (high, pending)
            ('2025-02-15', 1, 7),   -- Existing: Budget Planning (medium, pending)
            ('2025-02-15', 1, 9),   -- Marketing Strategy (medium, pending)
            ('2025-02-15', 1, 10),  -- Employee Reviews (high, in_progress)
            ('2025-02-15', 1, 11),  -- Office Supply Inventory (low, completed)
            ('2025-02-15', 1, 12),  -- Vendor Contract Review (medium, in_progress)

            -- Enock's assignments (id: 2)
            ('2025-02-15', 2, 2),   -- Existing: Team Building (medium, in_progress)
            ('2025-02-15', 2, 8),   -- Existing: Training Workshop (low, in_progress)
            ('2025-02-15', 2, 13),  -- Project Timeline (high, completed)
            ('2025-02-15', 2, 14),  -- Customer Survey (low, pending)
            ('2025-02-15', 2, 15),  -- Department Budget (medium, in_progress)
            ('2025-02-15', 2, 16),  -- Equipment Maintenance (low, completed)

            -- Keeran's assignments (id: 3)
            ('2025-02-15', 3, 3),   -- Existing: Client Presentation (high, completed)
            ('2025-02-15', 3, 17),  -- Sales Report (high, pending)
            ('2025-02-15', 3, 18),  -- Team Schedule (medium, in_progress)
            ('2025-02-15', 3, 19),  -- Client Follow-up (low, completed)
            ('2025-02-15', 3, 20),  -- Product Launch (high, pending)

            -- Madiba's assignments (id: 4)
            ('2025-02-15', 4, 4),   -- Existing: Software Update (medium, pending)
            ('2025-02-15', 4, 21),  -- Code Review (high, in_progress)
            ('2025-02-15', 4, 22),  -- System Backup (medium, completed)
            ('2025-02-15', 4, 23),  -- Bug Fixes (high, pending)
            ('2025-02-15', 4, 24),  -- Performance Testing (low, in_progress)

            -- Mason's assignments (id: 5)
            ('2025-02-15', 5, 5),   -- Existing: Documentation Review (low, in_progress)
            ('2025-02-15', 5, 25),  -- API Updates (high, completed)
            ('2025-02-15', 5, 26),  -- User Guide (medium, pending)
            ('2025-02-15', 5, 27),  -- Technical Review (low, in_progress)
            ('2025-02-15', 5, 28),  -- Documentation Template (medium, completed)

            -- Arnold's assignments (id: 6)
            ('2025-02-15', 6, 6),   -- Existing: Security Audit (high, completed)
            ('2025-02-15', 6, 29),  -- Security Review (high, pending)
            ('2025-02-15', 6, 30),  -- Access Control (medium, in_progress)
            ('2025-02-15', 6, 31),  -- Vulnerability Scan (low, completed)
            ('2025-02-15', 6, 32);  -- Incident Response (high, pending)
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
                name VARCHAR(255) NOT NULL,
                description TEXT,
                date DATE NOT NULL,
                status task_status NOT NULL DEFAULT 'pending',
                priority task_priority NOT NULL DEFAULT 'medium',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            -- Create some sample tasks
            INSERT INTO Task (name, description, date, status, priority) VALUES
            ('Quarterly Report Review', 'Review and finalize Q1 2025 financial reports', DATE '2025-03-15', 'pending', 'high'),
            ('Team Building Event', 'Organize virtual team building activity', DATE '2025-02-28', 'in_progress', 'medium'),
            ('Client Presentation', 'Prepare presentation for new client pitch', DATE '2025-02-20', 'completed', 'high'),
            ('Software Update', 'Deploy latest software updates to production', DATE '2025-02-25', 'pending', 'medium'),
            ('Documentation Review', 'Review and update API documentation', DATE '2025-03-01', 'in_progress', 'low'),
            ('Security Audit', 'Conduct monthly security audit', DATE '2025-02-18', 'completed', 'high'),
            ('Budget Planning', 'Create budget plan for Q2 2025', DATE '2025-03-20', 'pending', 'medium'),
            ('Training Workshop', 'Conduct new employee training workshop', DATE '2025-02-22', 'in_progress', 'low');
            
            -- New Tasks (adding to existing ones)
            INSERT INTO Task (name, description, date, status, priority) VALUES
            -- Rin's additional tasks
            ('Marketing Strategy', 'Develop Q2 marketing strategy', '2025-03-10', 'pending', 'medium'),
            ('Employee Reviews', 'Conduct annual employee reviews', '2025-03-25', 'in_progress', 'high'),
            ('Office Supply Inventory', 'Update office supply tracking system', '2025-02-28', 'completed', 'low'),
            ('Vendor Contract Review', 'Review and renew vendor contracts', '2025-03-15', 'in_progress', 'medium'),

            -- Enock's additional tasks
            ('Project Timeline', 'Create project timeline for Q2', '2025-03-05', 'completed', 'high'),
            ('Customer Survey', 'Analyze customer satisfaction survey results', '2025-03-12', 'pending', 'low'),
            ('Department Budget', 'Review department budget allocation', '2025-03-20', 'in_progress', 'medium'),
            ('Equipment Maintenance', 'Schedule regular equipment maintenance', '2025-02-25', 'completed', 'low'),

            -- Keeran's additional tasks
            ('Sales Report', 'Compile monthly sales report', '2025-03-01', 'pending', 'high'),
            ('Team Schedule', 'Optimize team work schedule', '2025-03-08', 'in_progress', 'medium'),
            ('Client Follow-up', 'Follow up with potential clients', '2025-02-28', 'completed', 'low'),
            ('Product Launch', 'Coordinate new product launch', '2025-03-15', 'pending', 'high'),

            -- Madiba's additional tasks
            ('Code Review', 'Review pull requests for new features', '2025-03-02', 'in_progress', 'high'),
            ('System Backup', 'Perform system backup and verification', '2025-02-25', 'completed', 'medium'),
            ('Bug Fixes', 'Address high-priority bug reports', '2025-03-10', 'pending', 'high'),
            ('Performance Testing', 'Conduct application performance tests', '2025-03-05', 'in_progress', 'low'),

            -- Mason's additional tasks
            ('API Updates', 'Update API endpoint documentation', '2025-03-01', 'completed', 'high'),
            ('User Guide', 'Create user guide for new features', '2025-03-10', 'pending', 'medium'),
            ('Technical Review', 'Review technical specifications', '2025-02-28', 'in_progress', 'low'),
            ('Documentation Template', 'Create new documentation templates', '2025-03-15', 'completed', 'medium'),

            -- Arnold's additional tasks
            ('Security Review', 'Review security protocols', '2025-03-05', 'pending', 'high'),
            ('Access Control', 'Update access control systems', '2025-03-12', 'in_progress', 'medium'),
            ('Vulnerability Scan', 'Run quarterly vulnerability scan', '2025-02-28', 'completed', 'low'),
            ('Incident Response', 'Update incident response plan', '2025-03-15', 'pending', 'high');
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

        await pool.query(`
            INSERT INTO users(username, email, password_hash, role, display_name, manager_id)
            VALUES($1, $2, $3, 'team_member', $4, $5)`,
            ['arnold', 'arnold@example.com', await hashPassword('arnold'), 'Arnold', 1]
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