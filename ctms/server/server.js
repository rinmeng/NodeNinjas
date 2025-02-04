const express = require('express');
const pool = require('./db');
const cors = require('cors');
const session = require('express-session');
const home = require('./routes/home');
const setup = require('./routes/setup');
const user = require('./routes/user');
const PORT = 5000;
const app = express();

app.use(express.json());

// Configure CORS
app.use(cors({
    origin: 'http://localhost:13000',
    credentials: true
}));

// Configure session - using express-session only
app.use(session({
    secret: 'ctms_by_nodeninjas',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,  // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
    },
    name: 'CTMS_sessionID'
}));

app.use('/', home);
app.use('/setup', setup);
app.use('/user', user);

// Session debugging middleware
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session Data:', req.session);
    next();
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log('Visit it at: http://localhost:' + PORT);
});