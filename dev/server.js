let express = require('express');
server = express();
const path = require('path');
let jsn = require('./images/assets/asset_list.json');


server.use(express.static(path.join(__dirname)));

server.get('/', function(req, res, next) {
    res.redirect('/menu');
});

server.get('/menu', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'pages/menu.html'));
});

server.get('/game', function(req, res, next) {
   res.sendFile(path.join(__dirname, 'pages/game.html'));
});

server.get('/space', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'pages/space.html'));
});

server.listen(3302, function () {
    console.log('Listening on port 3302!');
});
