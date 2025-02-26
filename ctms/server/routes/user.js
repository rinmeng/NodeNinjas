const express = require('express');
const pool = require('../db');
const router = express.Router();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { hashPassword, verifyPassword } = require('../utils/PasswordHasher');

const { isAuthenticated, isAuthAsAdmin } = require('../auth');

// GET /user (documentation)
router.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Endpoint Documentation</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.2/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 min-h-screen p-8">
    <div class="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-100 mb-6">User Endpoint Documentation</h1>
        
        <div class="space-y-8">
            <!-- Authentication Note -->
            <div class="bg-gray-700 p-4 rounded-lg">
                <h2 class="text-xl font-semibold text-blue-300 mb-2">Authentication</h2>
                <p class="text-gray-200">Some endpoints require authentication. Admin-only routes are protected by <code class="bg-gray-600 px-1 rounded">isAuthAsAdmin</code> middleware.</p>
            </div>

            <!-- Endpoints Section -->
            <div class="space-y-6">
                <!-- GET / -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /user/</h3>
                    <p class="text-gray-300 mt-2">Returns the main user endpoint navigation page.</p>
                </div>

                <!-- GET /user/all -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /user/all</h3>
                    <p class="text-gray-300 mt-2">Retrieves all users from the database.</p>
                    <div class="mt-2">
                        <span class="bg-red-900 text-red-100 text-sm font-medium px-2 py-1 rounded">Admin Only</span>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "username": string,
    "role": string,
    "display_name": string,
    "manager_id": number
}[]
                        </pre>
                    </div>
                </div>

                <!-- GET /user/userid/:id -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /user/userid/:id</h3>
                    <p class="text-gray-300 mt-2">Retrieves a user by their ID.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">id</code> - User ID (number)</p>
                    </div>
                </div>

                <!-- GET /user/username/:username -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /user/username/:username</h3>
                    <p class="text-gray-300 mt-2">Retrieves a user by their username.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">username</code> - Username (string)</p>
                    </div>
                </div>

                <!-- DELETE /user/delete/:id -->
                <div class="border-l-4 border-red-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">DELETE /user/delete/:id</h3>
                    <p class="text-gray-300 mt-2">Deletes a user by their ID.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Parameters:</h4>
                        <p class="text-gray-300"><code class="bg-gray-600 px-1 rounded">id</code> - User ID to delete (number)</p>
                    </div>
                </div>

                <!-- POST /user/add -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">POST /user/add</h3>
                    <p class="text-gray-300 mt-2">Adds a new user to the database.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "username": string,
    "email": string,
    "password_hash": string,
    "role": string,
    "display_name": string,
    "manager_id": number
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Response:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "id": number,
    "username": string,
    "email": string,
    "role": string,
    "display_name": string,
    "manager_id": number
}
                        </pre>  
                    </div>
                </div>

                <!-- POST /user/login -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">POST /user/login</h3>
                    <p class="text-gray-300 mt-2">Authenticates a user and creates a session.</p>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Request Body:</h4>
                        <pre class="bg-gray-700 p-3 rounded mt-2 text-sm text-gray-200">
{
    "username": string,
    "password_hash": string,
    "isRemembered": boolean
}
                        </pre>
                    </div>
                    <div class="mt-3">
                        <h4 class="font-medium text-gray-200">Notes:</h4>
                        <ul class="list-disc ml-5 text-gray-300">
                            <li>Session expires in 30 days if <code class="bg-gray-600 px-1 rounded">isRemembered</code> is true</li>
                            <li>Session expires in 1 hour if <code class="bg-gray-600 px-1 rounded">isRemembered</code> is false</li>
                        </ul>
                    </div>
                </div>

                <!-- POST /user/logout -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">POST /user/logout</h3>
                    <p class="text-gray-300 mt-2">Destroys the current user session and clears session cookie.</p>
                </div>

                <!-- GET /user/session -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-100">GET /user/session</h3>
                    <p class="text-gray-300 mt-2">Retrieves current session information including user details and expiration.</p>
                </div>
            </div>

            <!-- Error Handling -->
            <div class="bg-gray-700 p-4 rounded-lg mt-8">
                <h2 class="text-xl font-semibold text-yellow-300 mb-2">Error Responses</h2>
                <div class="space-y-2">
                    <p class="text-gray-200"><strong>404:</strong> Resource not found</p>
                    <p class="text-gray-200"><strong>401:</strong> Unauthorized access</p>
                    <p class="text-gray-200"><strong>500:</strong> Internal server error</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`);
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
    console.log('Session to destroy:', req.session);

    req.session.destroy((err) => {
        console.log('Session destroyed:', req.sessionID);
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
router.get('/under/:manager_id', async (req, res) => {
    const manager_id = req.params.manager_id;
    try {
        const data = await pool.query('SELECT * FROM users WHERE manager_id = $1', [manager_id]);
        if (data.rowCount === 0) {
            return res.status(404).json({ message: "No users found under this manager" });
        }
        return res.status(200).json(data.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ message: 'Error searching up users under manager.' });
    }
});

module.exports = router;