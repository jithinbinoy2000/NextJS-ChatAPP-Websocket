//server/Schema/roomSchema
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: { type: String,
       },
    members: [String],
    chats: [
      {
        user: String,
        message: String,
        time: Date,
      },
    ],
  });

const Room = mongoose.model('Room', RoomSchema);
module.exports = Room;
