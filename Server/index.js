require('dotenv').config();
require('./Connections/db.js');
const cors = require('cors');
const express = require('express');
const router = require('./Routes/routes.js');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for WebSocket
    methods: ["GET", "POST"]
  }
});

require('./Connections/socket.js')(io);

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server Running on ${port}`);
});
