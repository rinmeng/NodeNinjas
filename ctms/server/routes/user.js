const express = require('express');
const pool = require('../db');
const router = express.Router();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

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
        <br>
        <br> Examples: 
        <br> /add
        <pre>
const testAdd = () => {
    fetch(proxy + "user/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password_hash: formData.password,
        role: formData.role,
        display_name: formData.displayName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage(data.message);
          fetchData();
        }
      });
  };    
        </pre>
        <br> /delete/:id
        <pre>
const testDelete = () => {
    if (!deleteUserId) {
      setMessage("Please enter a valid user ID to delete");
      return;
    }
    fetch(proxy + \`user / delete/\${deleteUserId}\`, {
      method: "DELETE",
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.error) {
            setMessage(data.error);
        } else {
            setMessage(data.message);
            fetchData();
        }
    })
    .catch((error) => {
        setMessage("Failed to delete user");
    });
  };
        </pre >
    <br> /all
        <pre>
const fetchData = () => {
    fetch(proxy + "user/all")
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.error || "Unknown error occurred");
          });
        }
        return res.json();
      })
      .then((data) => {
        setBackendData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setMessage(error.message);
        setLoading(false);
      });
  };
        </pre >
        </h1>
        `);
});


// GET /user/add
router.get('/add', (req, res) => {
    res.send('<h1>Add a user by sending a POST request to this endpoint</h1>');
});

// POST /user/add
router.post('/add', async (req, res) => {
    const { username, email, password_hash, role, display_name } = req.body;
    if (!username || !email || !password_hash || !role || !display_name) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }
    try {
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, role, display_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [username, email, password_hash, role, display_name]
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
router.get('/all', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM users ORDER BY id ASC');
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Internal Server Error: Is database setup yet?' });
    }
});

// Modified check-session route
router.get('/checkSession', (req, res) => {
    if (req.session && req.session.user) {
        res.status(200).json({
            session: {
                user: req.session.user
            }
        });
    } else {
        res.status(401).json({
            message: "No active session found"
        });
    }
});


// GET /user/:id
router.get('/:id', async (req, res) => {
    const id = req.body.id;
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

// GET /user/:username
router.get('/:username', async (req, res) => {
    const username = req.body.username;
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
    const { username, password_hash } = req.body;
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
                display_name: user.display_name
            };
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).json({ message: "Error saving session" });
                }
                return res.status(200).json({
                    message: "Login successful",
                    session: {
                        user: req.session.user
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
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.json({ message: "Logged out successfully" });
        });
    } else {
        res.json({ message: "No session to end" });
    }
});

module.exports = router;