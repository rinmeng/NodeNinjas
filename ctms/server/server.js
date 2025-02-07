const express = require('express');
const pool = require('./db');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const home = require('./routes/home');
const setup = require('./routes/setup');
const user = require('./routes/user');
const task = require('./routes/task');
const PORT = 5000;
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

// Enhanced session debugging middleware
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session Data:', req.session);
    console.log('Cookie MaxAge:', req.session.cookie.maxAge);
    console.log('Remember Me:', req.body?.isRemembered);
    next();
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log('Visit it at: http://localhost:' + PORT);
});