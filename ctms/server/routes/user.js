const express = require('express');
const pool = require('../db');
const router = express.Router();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const { isAuthenticated } = require('../auth');
const { isAuthAsAdmin } = require('../auth');

// CREATE TYPE user_role AS ENUM('admin', 'team_member');

// CREATE TABLE
// users(
//     id SERIAL PRIMARY KEY,
//     username VARCHAR(50) UNIQUE NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     password_hash VARCHAR(255) NOT NULL,
//     role user_role NOT NULL DEFAULT 'team_member',
//     display_name VARCHAR(100)
// );

// --Create indexes for common search operations
// CREATE INDEX idx_users_username ON users(username);

// CREATE INDEX idx_users_email ON users(email);

// CREATE INDEX idx_users_role ON users(role);


// GET /user
router.get('/', (req, res) => {
    res.send(`
        <h1 class="text-3xl">Use 
            <br> /add to add a user for this endpoint
            <br> /delete/:id to delete a user by id
            <br> /all to get all users
        `);
});


// GET /user/add
router.get('/add', (req, res) => {
    res.send('<h1>Add a user by sending a POST request to this endpoint</h1>');
});

// POST /user/add
router.post('/add', async (req, res) => {
    const { username, email, password_hash, role, display_name, manager_id
    } = req.body;
    if (!username || !email || !password_hash || !role || !display_name, !manager_id) {
        missingFields = [];
        if (!username) missingFields.push('username');
        if (!email) missingFields.push('email');
        if (!password_hash) missingFields.push('password_hash');
        if (!role) missingFields.push('role');
        if (!display_name) missingFields.push('display_name');
        if (!manager_id) missingFields.push('manager_id');

        return res.status(400).json({
            message: "Missing required fields: " + missingFields.join(', ')
        });
    }
    try {
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, role, display_name, manager_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING * ',
            [username, email, password_hash, role, display_name, manager_id]
        );
        if (result.rowCount === 0) {
            return res.status(400).json({ error: "User not added" });
        }
        return res.status(201).json({ message: "User added successfully" });
    } catch (err) {
        console.error('Error adding user:', err);

        // PostgreSQL error codes
        switch (err.code) {
            case '23505': // unique_violation
                const field = err.detail.includes('email') ? 'email' : 'username';
                return res.status(409).json({
                    message: `This ${field} is already registered`
                });
            case '23514': // check_violation
                return res.status(400).json({
                    message: "Invalid role. Must be either 'admin' or 'team_member'"
                });
            case '22001': // string_data_right_truncation
                return res.status(400).json({
                    message: "One or more fields exceed maximum length"
                });
            default:
                return res.status(500).json({
                    message: "An error occurred while adding the user"
                });
        }
    }
});

// GET /user/delete
router.get('/delete', (req, res) => {
    res.send('<h1>Delete a user by sending a DELETE request to this endpoint</h1>');
});

// DELETE /user/delete/:id
router.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    }
    catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).send({
            error: "An error occurred while deleting the user",
        });
    }
});

// GET /user/all
router.get('/all', isAuthAsAdmin, async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM users ORDER BY id ASC');
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ message: 'Internal Server Error: Is database loaded yet?' });
    }
});

// GET /user/session
router.get('/session', (req, res) => {
    if (req.session && req.session.user) {
        res.json({
            isValid: true,
            expiresIn: req.session.cookie.maxAge,
            user: req.session.user
        });
    } else {
        res.json({
            isValid: false,
            message: "No active session"
        });
    }
});


// GET /user/id/:id
router.get('/userid/:id', async (req, res) => {
    const id = req.body.id || req.params.id;
    try {
        const data = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (data.rowCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(data.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ message: 'Error searching up user id.' });
    }
});

// GET /user/username/:username
router.get('/username/:username', async (req, res) => {
    const username = req.body.username || req.params.username;
    try {
        const data = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (data.rowCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(data.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ message: 'Error searching up username.' });
    }
});



// Modified login route with proper session handling
router.post('/login', async (req, res) => {
    const { username, password_hash, isRemembered } = req.body;
    try {
        const data = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (data.rowCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = data.rows[0];
        if (user.password_hash === password_hash) {
            // Set session data
            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role,
                display_name: user.display_name,
                manager_id: user.manager_id
            };

            // Set session expiration based on "Remember Me"
            if (isRemembered) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            } else {
                req.session.cookie.maxAge = 1 * 60 * 60 * 1000; // 1 hour
            }

            // Save the session with new maxAge
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).json({ message: "Error saving session" });
                }

                // Also update the cookie settings in the response
                res.cookie('CTMS_sessionID', req.sessionID, {
                    maxAge: req.session.cookie.maxAge,
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax'
                });

                return res.status(200).json({
                    message: "Login successful",
                    session: {
                        user: req.session.user,
                        maxAge: req.session.cookie.maxAge
                    }
                });
            });
        } else {
            return res.status(401).json({ message: "Incorrect password" });
        }
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Error logging user in.' });
    }
});

// Modified logout route
router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ message: "Could not log out" });
            }
            // Clear the session cookie with the correct name
            res.clearCookie('CTMS_sessionID', {
                httpOnly: true,
                secure: false,
                sameSite: 'lax'
            });
            res.json({ message: "Logged out successfully" });
        });
    } else {
        res.json({ message: "No session to end" });
    }
});


module.exports = router;