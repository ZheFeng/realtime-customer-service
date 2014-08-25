var cookie = require('cookie')
var csOnline = []
var _ = require('lodash')
var ioAuthorization = function(socket, callback) {
  var cookieAhid, handshakeData, _ref, _ref1;
  handshakeData = socket.request;
  handshakeData.cookies = cookie.parse(handshakeData.headers.cookie);
  jmdcsId = handshakeData.cookies['__jmd_cschat_csId'];
  clientId = handshakeData.cookies['__jmd_cschat_clientId'];
  handshakeData.jmdcsId = jmdcsId;
  handshakeData.clientId = clientId;
  setTimeout(function(){
    callback(null, true);
  }, 10)

};

initCs = function(socket, io) {
  socket.join("room:jmdcsId:" + socket.request.jmdcsId)
  csOnline.push(socket.request.jmdcsId)
  socket.on("disconnect", function(){
    _.remove(csOnline, function(id) { return id === socket.request.jmdcsId})
  })
}
initClient = function(socket, io){
  socket.join("room:clientId:" + socket.request.clientId)

  socket.on('clientMessage', function (data) {

    if (!data.to){
      data.to = csOnline[_.random(csOnline.length - 1)]
    }

    io.to("room:jmdcsId:" + data.to).emit("clientMessage", {message: data.message, from: socket.request.clientId})
  });
}


exports.start = function (server) {

  var ioRedis = require('socket.io-redis')
  var io = require('socket.io')(server);
  io.adapter(ioRedis("localdb:6379"));
  io.use(function(socket, next) {
    return ioAuthorization(socket, function(err, user) {
      return next();
    });
  });

  console.log("Socket started: " + new Date());

  io.on('connection', function (socket) {
    if (socket.request.jmdcsId){
      initCs(socket, io)
    }
    else if (socket.request.clientId){
      initClient(socket, io)
    }



    socket.emit('ready', {  });


  });

}
