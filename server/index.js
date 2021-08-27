const path = require('path');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io');

const io = new Server(server);

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
  res.sendFile('/index.html');
});

// Socket
io.on('connection', socket => {
  console.log('user connected');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
