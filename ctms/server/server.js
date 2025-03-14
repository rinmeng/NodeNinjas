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

const { Server } = require('socket.io');

const allowedOrigins = [
    'http://localhost:13000',    // Docker frontend external port
    'http://localhost:3000',     // Direct frontend dev server
    'http://192.168.1.67:3000',
];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

app.set('io', io);


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

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // Store the userId in the socket object for later use
    let connectedUserId;

    // User joins their own room based on user ID
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        connectedUserId = userId; // Store the userId for disconnect
        console.log(`User ${userId} joined their room`);

        pool.query('UPDATE users SET is_online = true WHERE id = $1', [userId], (err, res) => {
            if (err) {
                console.error(err);
            } else {
                // Broadcast to all connected clients that this user is now online
                io.emit('userStatusChange', { userId, isOnline: true });
            }
        });
    });

    socket.on('typing', (data) => {
        socket.to(`user_${data.receiverId}`).emit('userTyping', {
            senderId: data.senderId,
            isTyping: true
        });
    });

    socket.on('stopTyping', (data) => {
        socket.to(`user_${data.receiverId}`).emit('userTyping', {
            senderId: data.senderId,
            isTyping: false
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Only update if we have a userId stored
        if (connectedUserId) {
            pool.query('UPDATE users SET is_online = false WHERE id = $1', [connectedUserId], (err, res) => {
                if (err) {
                    console.error('Error setting user offline:', err);
                } else {
                    console.log(`User ${connectedUserId} is now offline`);
                    // Broadcast to all connected clients that this user is now offline
                    io.emit('userStatusChange', { userId: connectedUserId, isOnline: false });
                }
            });
        }
    });
});


// if testing, don't start server
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = { app };