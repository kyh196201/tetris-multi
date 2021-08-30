const path = require('path');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io');

const io = new Server(server);

const users = [];

let isPlaying = false;

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
    if (!isPlaying) {
      users.push(data);

      io.emit('update-users', users);
    } else {
      io.to(data.id).emit('access-denied', {
        message: '게임이 이미 시작되었습니다.',
      });
    }
  });

  socket.on('user-leave', ({id}) => {
    const index = findUserIndex(id);

    if (index === -1) return;

    users.splice(index, 1);

    io.emit('update-users', users);
  });

  // ready event
  socket.on('user-ready', ({id, account}) => {
    const user = findUser(id);

    if (!user) return;

    user.account = {
      ...user.account,
      ...account,
    };

    io.emit('update-users', users);

    const isAllReady = users.every(u => !!u.account.ready);

    if (isAllReady) {
      io.emit('play', true);
      isPlaying = true;
    }
  });

  socket.on('update-board', data => {
    socket.broadcast.emit('update-board', data);
  });

  socket.on('user-gameover', ({id, account}) => {
    const user = findUser(id);

    if (!user) return;

    user.account = {
      ...user.account,
      ...account,
    };

    const isAllGameover = users.every(u => u.account.status === 'gameover');

    if (isAllGameover) {
      io.emit('gameover', {
        users,
      });
      isPlaying = false;
    }
  });

  // disconnect
  socket.on('disconnect', () => {
    const index = findUserIndex(socket.id);

    if (index > -1) {
      users.splice(index, 1);
      io.emit('update-users', users);

      if (!users.length) {
        isPlaying = false;
      }
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

// Functions
function findUser(id) {
  return users.find(user => user.id === id);
}

function findUserIndex(id) {
  return users.findIndex(user => user.id === id);
}
