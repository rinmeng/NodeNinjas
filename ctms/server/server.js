const setupPgSession = require('./routes/setupPgSession');
const express = require('express');
const pool = require('./db');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const http = require('http'); // Import HTTP module
const { Server } = require('socket.io'); // Import Socket.IO

const home = require('./routes/home');
const setup = require('./routes/setup');
const user = require('./routes/user');
const task = require('./routes/task');
const message = require('./routes/message');
const notification = require('./routes/notification');

const PORT = 5001;
const app = express();
const allowedOrigins = ['http://localhost:3000', 'http://localhost:13000'];

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO with CORS (void app.listen and use server.listen instead)
// Why Not Just Use app.listen(PORT)?
// Normally, when using Express alone, you'd start the server like this:
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
// This works fine for a basic API, but it does not support WebSockets(Socket.IO).

const io = new Server(server, {
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

// 🔴 Socket.IO Logic 🔴
// io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     // Handling notifications
//     socket.on('sendNotification', async (data) => {
//         console.log('New notification:', data);

//         const { user_id, message, type } = data;
//         try {
//             await pool.query(
//                 `INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)`,
//                 [user_id, message, type]
//             );

//             // Send notification to the specific user
//             io.emit(`notification:${user_id}`, data);
//         } catch (err) {
//             console.error('Error saving notification:', err);
//         }
//     });

//     socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//     });
// });

// Start server
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log('Server is running on port ' + PORT);
        console.log('Visit it at: http://localhost:' + PORT);
    });
}

module.exports = { app, io };