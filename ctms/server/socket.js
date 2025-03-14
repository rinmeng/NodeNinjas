// socket.js
const { Server } = require('socket.io');
let io;

function initialize(httpServer, corsOptions) {
    io = new Server(httpServer, {
        cors: {
            origin: corsOptions.cors.origin, // Use the same origins as defined in server.js
            methods: corsOptions.cors.methods,
            credentials: true // Must be true when handling credentialed requests
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('user_connected', (userId) => {
            console.log(`User ${userId} connected with socket ${socket.id}`);
            socket.userId = userId;
            socket.join(`user_${userId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
}

module.exports = { initialize, getIO };