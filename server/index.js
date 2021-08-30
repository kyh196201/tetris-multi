const path = require('path');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io');

const io = new Server(server);

const users = [];

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// Socket
io.on('connection', socket => {
  console.log('user connected', socket.id);

  // Socket events
  // user enter event
  socket.on('user-enter', data => {
    users.push(data);

    io.emit('update-users', users);
  });

  // ready event
  socket.on('user-ready', ({id, account}) => {
    const user = users.find(u => u.id === id);

    if (!user) return;

    user.account = {
      ...account,
    };

    io.emit('update-users', users);

    const isAllReady = users.every(u => !!u.account.ready);

    if (isAllReady) {
      io.emit('play', true);
    }
  });

  socket.on('update-board', data => {
    socket.broadcast.emit('update-board', data);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
