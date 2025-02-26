const express = require('express');
const pool = require('./db');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const home = require('./routes/home');
const setup = require('./routes/setup');
const user = require('./routes/user');
const task = require('./routes/task');
const message = require('./routes/message');
const notification = require('./routes/notification');
const PORT = 5001;
const app = express();
const allowedOrigins = ['http://localhost:3000', 'http://localhost:13000'];

app.use(express.json());

// Configure CORS dynamically
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize app with database check and session setup
async function initializeApp() {
    try {
        // Check if user_sessions exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'user_sessions'
            );
        `);

        const tableExists = tableCheck.rows[0].exists;

        if (!tableExists) {
            console.log("Session table does not exist, creating it now...");
            await pool.query(`
                CREATE TABLE IF NOT EXISTS user_sessions (
                    sid VARCHAR(100) PRIMARY KEY,
                    sess JSON NOT NULL,
                    expire TIMESTAMP(6) NOT NULL
                );
            `);
            console.log("Session table created successfully");
        } else {
            console.log("Session table already exists");
        }

        // Create session store
        const sessionStore = new pgSession({
            pool: pool,
            tableName: 'user_sessions'
        });

        // Configure session with dynamic maxAge
        app.use(session({
            store: sessionStore,
            secret: 'ctms_by_nodeninjas',
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: false,  // Set to true if using HTTPS
                sameSite: 'lax'
            },
            name: 'CTMS_sessionID'
        }));

        app.use('/', home);
        app.use('/setup', setup);
        app.use('/user', user);
        app.use('/task', task);
        app.use('/message', message);
        app.use('/notification', notification);

        // Enhanced session debugging middleware
        app.use((req, res, next) => {
            console.log('Session ID:', req.sessionID);
            console.log('Session Data:', req.session);
            console.log('Cookie MaxAge:', req.session.cookie.maxAge);
            console.log('Remember Me:', req.body?.isRemembered);
            next();
        });

        if (process.env.NODE_ENV !== 'test') {
            const server = app.listen(PORT, () => {
                console.log('Server is running on port ' + PORT);
                console.log('Visit it at: http://localhost:' + PORT);
            });
        }
    } catch (error) {
        console.error("Error initializing application:", error);
        process.exit(1); // Exit with error code
    }
}

// Start the initialization process
initializeApp();

module.exports = app;