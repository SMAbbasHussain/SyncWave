const socketIO = require('socket.io');

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*', // Allow all origins (update in production)
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room for private messaging
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    // Handle private messages
    socket.on('privateMessage', ({ room, message, username }) => {
      const timestamp = new Date().toISOString(); // Send timestamp as ISO string
      io.to(room).emit('privateMessage', { username, message, timestamp });
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = setupSocket;