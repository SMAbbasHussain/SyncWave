const socketIO = require('socket.io');
const { verifyToken } = require('../utils/jwtUtils');

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000', // Specific origin instead of *
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000, // 60 seconds without pong to consider connection dead
    pingInterval: 25000 // Send ping every 25 seconds
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = await verifyToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id, 'User ID:', socket.user?.userId);

    // Automatically join user's personal room
    if (socket.user?.userId) {
      socket.join(`user_${socket.user.userId}`);
    }

    // Join a room for private messaging
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`User ${socket.user?.userId} joined room: ${room}`);
    });

    // Handle private messages with error handling
    socket.on('privateMessage', async ({ room, message }, callback) => {
      try {
        if (!room || !message) {
          throw new Error('Room and message are required');
        }

        const timestamp = new Date();
        io.to(room).emit('privateMessage', {
          senderId: socket.user.userId,
          message,
          timestamp: timestamp.toISOString()
        });

        // Optional acknowledgement
        if (typeof callback === 'function') {
          callback({ status: 'delivered', timestamp });
        }
      } catch (err) {
        console.error('Message error:', err);
        if (typeof callback === 'function') {
          callback({ status: 'error', error: err.message });
        }
      }
    });

    // Handle disconnections
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.id} (${reason})`);
    });

    // Error handling
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });

  return io;
};

module.exports = setupSocket;