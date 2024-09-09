const { authenticationToken } = require("../Middlewares/authTokenMiddleware");
const User = require('../Schemas/userSchema');
const Room = require('../Schemas/roomSchema');
const { loginUser } = require("../Controllers/usercontroller");

module.exports = (io) => {
  // Middleware for authenticating users
  io.use(authenticationToken).on('connection', async (socket) => {
    console.log(`${socket.user.username} connected`);

    // Update user's online status when they connect
    try {
      await User.updateOne({ username: socket.user.username }, { online: true });
    } catch (error) {
      console.log("Error in updating status:", error);
    }

    // Function to emit the list of available rooms
    const emitAvailableRooms = async () => {
      try {
        const rooms = await Room.find();
        const roomData = rooms.map(room => ({
          name: room.name,
          members: room.members.length,
          creator: room.creator, // Added creator information
        }));
        io.emit('availableRooms', roomData);
      } catch (error) {
        console.log("Error while fetching room data:", error);
      }
    };
    emitAvailableRooms();

    // Event handler for creating a new room
    socket.on('createRoom', async (roomName) => {
      try {
        if (!roomName || roomName.trim() === '') {
          socket.emit('error', 'Invalid room name');
          return;
        }
    
        // Check if the room already exists
        let room = await Room.findOne({ name: roomName });
        if (!room) {
          room = new Room({ 
            name: roomName, 
            members: [socket.user.username],
            chats: [], 
            creator: socket.user.username
          });
          await room.save();
          console.log(`Room created: ${roomName}`);
        } else {
          socket.emit('error', 'Room already exists');
          console.log(`Room already exists: ${roomName}`);
        }
        emitAvailableRooms();
      } catch (error) {
        console.log("Error while creating room:", error);
      }
    });

    // Event handler for joining a room
    socket.on('joinRoom', async (roomName) => {
      try {
        // Retrieve online status of all users
        const users = await User.find();
        let status = [];
        if (users) {
          status = users.map(user => ({
            username: user.username,
            online: user.online
          }));
        }
        
        // Check if the room exists and add user to the room
        let room = await Room.findOne({ name: roomName });
        if (room) {
          if (!room.members.includes(socket.user.username)) {
            room.members.push(socket.user.username);
            await room.save();
          }
          socket.join(roomName);

          // Notify room of the new user
          const joinMessage = {
            user: 'system',
            message: `${socket.user.username} has joined the room`,
            time: new Date(),
          };
          room.chats.push(joinMessage);
          await room.save();        
          io.to(roomName).emit('chatHistory', room.chats);
          io.to(roomName).emit('onlineUser', status);
          emitAvailableRooms();
        }
      } catch (error) {
        console.log("Error while joining room:", error);
      }
    });

    // Event handler for sending a message
    socket.on('sendMessage', async ({ roomName, message }) => {
      try {
        let room = await Room.findOne({ name: roomName });
        if (room) {
          const chatMessage = {
            user: socket.user.username,
            message,
            time: new Date(),
          };
          room.chats.push(chatMessage);
          await room.save();
          io.to(roomName).emit("newMessage", chatMessage);
        }
      } catch (error) {
        console.log("Error in sending message:", error);
      }
    });

    // Event handler for typing indication
    socket.on('typing', (roomName) => {
      socket.to(roomName).emit('userTyping', socket.user.username);
    });

    // Event handler for stopping typing indication
    socket.on('stopTyping', (roomName) => {
      socket.to(roomName).emit('userStoppedTyping', socket.user.username);
    });

    // Event handler for deleting a room
    socket.on('deleteRoom', async (roomName) => {
      try {
        const room = await Room.findOne({ name: roomName });
        if (room && room.creator === socket.user.username) {
          await Room.deleteOne({ name: roomName });
          console.log(`Room deleted: ${roomName}`);
          emitAvailableRooms();
        } else {
          socket.emit('error', 'You are not authorized to delete this room.');
        }
      } catch (error) {
        console.log("Error while deleting room:", error);
      }
    });

    // Event handler for disconnection
    socket.on('disconnect', async () => {
      try {
        await User.updateOne({ username: socket.user.username }, { online: false });
        console.log(`${socket.user.username} disconnected`);
        emitAvailableRooms();
      } catch (error) {
        console.log("Error during disconnection:", error);
      }
    });
  });
};
