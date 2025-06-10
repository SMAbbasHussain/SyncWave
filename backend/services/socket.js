const { saveMessage } = require('../controllers/chatController');

function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id} (User: ${socket.user?.id || 'unknown'})`);

    // Join user to their personal room
    if (socket.user?.id) {
      socket.join(`user_${socket.user.id}`);
    }

    // Handle private messages
    socket.on('privateMessage', async ({ receiverId, content }, callback) => {
      try {
        const message = await saveMessage({
          senderId: socket.user.id,
          receiverId,
          content
        }, { io });

        // Emit to sender and receiver
        io.to(`user_${receiverId}`).emit('newMessage', message);
        callback({ status: 'delivered', message });
      } catch (err) {
        callback({ status: 'failed', error: err.message });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user?.id || 'unknown'}`);
    });

    // Error handling
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });
};

module.exports = {initializeSocket};