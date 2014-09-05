var cookie = require('cookie')
var _ = require('lodash')
var redisConfig = require("./config/redis")
var Message = require("./models").Message;
var userStatus = require("./userStatus");
var sequelize = require("./models").sequelize
var redisConnection = {
  port: redisConfig.port,
  host: redisConfig.host
}
var redisHost = redisConnection.host + ":" + redisConnection.port


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

saveMessage = function(from, to, text, callback){

  var message = Message.build({
    from: from,
    to: to,
    message: text
  })
  message.save().success(callback)
}


initCs = function(socket, io) {
  socket.join("room:jmdcsId:" + socket.request.jmdcsId)
  usercode = socket.request.jmdcsId

  socket.on('csMessage', function (data) {
    to = data.to
    from = usercode
    message = data.message


    saveMessage(from, to, message, function(){
      io.to("room:clientId:" + data.to).emit("csMessage", {message: message})
    })
  });
}
initClient = function(socket, io){
  socket.join("room:clientId:" + socket.request.clientId)

  socket.on('clientMessage', function (data) {
    to = "cs"
    from = socket.request.clientId
    message = data.message


    saveMessage(from, to, message, function(){
      io.to("room:jmdcsId:"+ to).emit("clientMessage", {message: message, from: from})
    })
  });
}

updateOnlineUser = function(io) {
  to = "cs"
  userStatus.onlineUsers(function(err, online){
    sequelize.query("SELECT * FROM Users WHERE usercode <> 'cs'").success(function(users) {
      io.to("room:jmdcsId:"+ to).emit("onlineUsers", {users: users, online: online})
    })
  })
  // sequelize.query("SELECT * FROM Users WHERE online = 1 and usercode <> 'cs'").success(function(users) {
  //   res.send(users)
  // })
}


exports.start = function (server) {

  var ioRedis = require('socket.io-redis')
  var io = require('socket.io')(server);
  io.adapter(ioRedis(redisHost));
  io.use(function(socket, next) {
    return ioAuthorization(socket, function(err, user) {
      return next();
    });
  });

  console.log("Socket started: " + new Date());

  io.on('connection', function (socket) {
    var usercode = null;
    if (socket.request.jmdcsId){
      usercode = socket.request.jmdcsId
      initCs(socket, io)
    }
    else if (socket.request.clientId){
      usercode = socket.request.clientId
      initClient(socket, io)
    }

    userStatus.connect(usercode, socket.id, function(){
      updateOnlineUser(io)
    });

    socket.on("disconnect", function(){
      userStatus.disconnect(usercode, socket.id, function(){
        updateOnlineUser(io)
      });
    })



    socket.emit('ready', {  });


  });

}
