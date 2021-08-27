const path = require('path');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io');

const io = new Server(server);

const participants = [];

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// Socket
io.on('connection', socket => {
  console.log('user connected');

  // Socket events
  // user enter event
  socket.on('user-enter', participant => {
    if (
      participants.findIndex(account => account.user === participant.user) ===
      -1
    ) {
      participants.push(participant);
    }

    console.log('participants', participants);
  });

  // ready event
  socket.on('user-ready', ({user, ready}) => {
    const participant = participants.find(account => account.user === user);
    participant.ready = ready;

    if (participants.every(account => !!account.ready)) {
      io.emit('all-ready', true);
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
