let express = require('express');
server = express();
const path = require('path');

server.use(express.static(path.join(__dirname)));
//server.use(express.static(path.join(__dirname) + '/pages/'));



server.get('/menu', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'pages/index.html'));
});

server.get('/game', function(req, res, next) {
   res.sendFile(path.join(__dirname, 'pages/game.html'));
});

server.listen(3000, function () {
    console.log('Listenning on port 3000!');
});