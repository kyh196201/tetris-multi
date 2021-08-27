const path = require('path');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
  res.sendFile('/index.html');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
