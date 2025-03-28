const express = require('express');
const pool = require('../db');
const router = express.Router();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { hashPassword, verifyPassword } = require('../utils/PasswordHasher');

const { isAuthenticated, isAuthAsAdmin } = require('../auth');

// DELETE /user/delete/:id
router.delete('/delete/:id', isAuthAsAdmin, async (req, res) => {
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

router.post('/register', async (req, res) => {
    const { username, email, password_hash, role, display_name, manager_id } = req.body;

    // Add validation for required fields
    if (!username || !email || !password_hash || !role || !display_name) {
        return res.status(400).json({ message: 'Required fields: username, email, password_hash, role, display_name' });

    }
    // check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    // check if email already exists
    const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rowCount != 0) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    if (emailExists.rowCount != 0) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    try {
        const hashedPassword = await hashPassword(password_hash);
        const data = await pool.query(`
            INSERT INTO users (username, email, password_hash, role, display_name, manager_id)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [username, email, hashedPassword, role, display_name, manager_id]);
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send({ message: 'Error adding user.' });
    }
});

// GET /user/id/:id
router.get('/userid/:id', isAuthenticated, async (req, res) => {
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

// PUT /user/update/:id
router.put('/update/:id', isAuthAsAdmin, async (req, res) => {
    const id = req.body.id;
    const { username, email, password_hash, role, display_name, manager_id } = req.body;

    // Add validation for required fields
    if (!username || !email || !password_hash || !role || !display_name) {
        return res.status(400).json({ message: 'Required fields: username, email, password_hash, role, display_name' });

    }
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (user.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const
            data = await pool.query(`
            UPDATE users
            SET username = $1, email = $2, password_hash = $3, role = $4, display_name = $5, manager_id = $6
            WHERE id = $7 RETURNING *`,
                [username, email, password_hash, role, display_name, manager_id, id]);
        res.status(200).json(data.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ message: 'Error updating user.' });
    }
});
//updating the user's role
router.put('/updateRole/:id', isAuthAsAdmin, async (req, res) => {
    const id = req.params.id;
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ message: "Role is required" });
    }

    try {
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (user.rowCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const updatedUser = await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING *', [role, id]);
        res.status(200).json(updatedUser.rows[0]);

    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Something went wrong while updating user role" });
    }
});

// Modified login route with proper session handling
router.post('/login', async (req, res) => {
    const { username, password_hash, isRemembered } = req.body;


    if (!username || !password_hash) {
        return res.status(400).json({ message: "Username and password required" });
    }

    try {
        const data = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (data.rowCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = data.rows[0];
        const isPasswordValid = await verifyPassword(password_hash, user.password_hash);
        const isPasswordValidOld = (password_hash === user.password_hash);

        if (isPasswordValid || isPasswordValidOld) {
            // Set session data
            req.session.user = data.rows[0];

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
        res.status(500).json({ message: 'Error logging in user' });
    }
});

// GET /user/session
router.get('/session', (req, res) => {
    if (req.session && req.session.user) {
        return res.status(200).json({
            isValid: true,
            expiresIn: req.session.cookie.maxAge,
            user: req.session.user
        });
    } else {
        return res.status(404).json({
            message: "No active session"
        });
    }
});

// Modified logout route
router.post('/logout', (req, res) => {
    if (!req.session.user) {
        return res.status(400).json({ message: "No user to log out" });
    }

    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: "Error logging out user" });
        }

        res.clearCookie('CTMS_sessionID', {
            httpOnly: true,
            secure: false,  // Set to true in production if using HTTPS
            sameSite: 'lax'
        });

        return res.status(200).json({ message: "Logout successful" }); // Now send the success response
    });
});

// GET /user/under/:manager_id
router.get('/under/:manager_id', isAuthenticated, async (req, res) => {
    const manager_id = req.params.manager_id;
    try {
        const data = await pool.query('SELECT * FROM users WHERE manager_id = $1', [manager_id]);
        if (data.rowCount === 0) {
            return res.status(404).json({ message: "No users found under this manager." });
        }
        return res.status(200).json(data.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ message: 'Error searching up users under manager.' });
    }
});


//Put / change_manager_id/:id
router.put('/change_manager_id/:id', isAuthAsAdmin, async (req, res) => {
    const id = req.params.id;
    const { manager_id } = req.body;
    if (!manager_id || !id) {
        return res.status(400).json({ message: "Manager ID is required" });
    }
    try {
        const user = await pool.query('SELECT * FROM users WHERE id =$1', [id]);
        if (user.rowCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const updatedUser = await pool.query('UPDATE users SET manager_id=$1 WHERE id=$2 RETURNING *', [manager_id, id]);
        res.status(200).json(updatedUser.rows[0]);
    }
    catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Something went wrong while updating user role" });
    }


})

module.exports = router;