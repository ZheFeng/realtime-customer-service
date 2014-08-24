
rooms = {}
sendToRoom = function (room, key, data) {
  for (var socket in rooms[room]) {
    if (!data) {
      data = {}
    }
    socket.emit(key, data)
  }
}

exports.start = function (server) {

  var io = require('socket.io')(server);

  console.log("Socket started: " + new Date());

  io.on('connection', function (socket) {
    socket.emit('ready', {  });
    // socket.on('my other event', function (data) {
    //   console.log(data);
    // });
  });

}
