const PORT = 5001;
const setupPgSession = require('./routes/setupPgSession');
const express = require('express');
const pool = require('./db');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const http = require('http');

const home = require('./routes/home');
const setup = require('./routes/setup');
const user = require('./routes/user');
const task = require('./routes/task');
const message = require('./routes/message');
const notification = require('./routes/notification');

const app = express();
const server = http.createServer(app);


const allowedOrigins = [
    'http://localhost:13000',    // Docker frontend external port
    'http://localhost:3000',     // Direct frontend dev server
    'http://192.168.1.134:13000', // IP access to Docker frontend 
    'http://142.231.92.199/15000',
    'http://142.231.92.199:3000',
];

// Session store
const sessionStore = new pgSession({
    pool: pool,
    tableName: 'user_sessions'
});

app.use(express.json());

// Configure CORS dynamically
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Call to setup pgSession table
setupPgSession();

// Configure session
app.use(session({
    store: sessionStore,
    secret: 'ctms_by_nodeninjas',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,  // Set to true if using HTTPS
        sameSite: 'lax',
    },
    name: 'CTMS_sessionID'
}));

app.use('/', home);
app.use('/setup', setup);
app.use('/user', user);
app.use('/task', task);
app.use('/message', message);
app.use('/notification', notification);



// if testing, don't start server
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = { app };