const ChatMessage = require('../models/ChatMessage');

module.exports = function(io) {
  let waitingUser = null;

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('newChat', async () => {
      console.log(`newChat event from ${socket.id}`);
      if (waitingUser && waitingUser.id !== socket.id) {
        const roomID = `room-${waitingUser.id}-${socket.id}`;
        waitingUser.join(roomID);
        socket.join(roomID);
        // Optionally, fetch and send chat history here.
        io.to(roomID).emit('chatStarted', { room: roomID });
        waitingUser = null;
      } else {
        waitingUser = socket;
        socket.emit('waiting', { message: 'Waiting for a partner...' });
      }
    });

    socket.on('sendMessage', async (data) => {
      const { room, message } = data;
      try {
        const chatMsg = new ChatMessage({ room, sender: socket.id, message });
        await chatMsg.save();
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
      io.to(room).emit('message', { sender: socket.id, message });
    });

    socket.on('typing', (data) => {
      socket.to(data.room).emit('typing', { sender: socket.id });
    });

    socket.on('skipChat', (data) => {
      io.to(data.room).emit('skipped', { message: 'User has disconnected. Please start a new chat.' });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      if (waitingUser && waitingUser.id === socket.id) {
        waitingUser = null;
      }
    });
  });
};