const setupPgSession = require('./routes/setupPgSession');
const express = require('express');
const pool = require('./db');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Server } = require('socket.io'); // Import Socket.IO
const serverless = require('serverless-http'); // Import serverless-http

const home = require('./routes/home');
const setup = require('./routes/setup');
const user = require('./routes/user');
const task = require('./routes/task');
const message = require('./routes/message');
const notification = require('./routes/notification');

const PORT = 5001;
const app = express();
const allowedOrigins = ['http://localhost:3000', 'http://localhost:13000', "https://vitectms.vercel.app/"];

// Set up Socket.IO with CORS (void app.listen and use server.listen instead)
// Normally, when using Express alone, you'd start the server like this:
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
// This works fine for a basic API, but it does not support WebSockets(Socket.IO).

const io = new Server(app, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST']
    }
});

// Session store
const sessionStore = new pgSession({
    pool: pool,
    tableName: 'user_sessions'
});

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

// Socket.IO Logic (If you want to keep using socket.io, you might need to consider alternatives like Pusher or Ably for serverless)
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handling notifications
    socket.on('sendNotification', async (data) => {
        console.log('New notification:', data);

        const { user_id, message, type } = data;
        try {
            await pool.query(
                `INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)`,
                [user_id, message, type]
            );

            // Send notification to the specific user
            io.emit(`notification:${user_id}`, data);
        } catch (err) {
            console.error('Error saving notification:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start server
// No need for manual HTTP server creation for Vercel (commented out):
// const server = http.createServer(app);
// server.listen(PORT, () => {
//     console.log('Server is running on port ' + PORT);
//     console.log('Visit it at: http://localhost:' + PORT);
// });

// Wrap the app using serverless-http
module.exports.handler = serverless(app);

