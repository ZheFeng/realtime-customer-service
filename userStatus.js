
var redisConfig = require("./config/redis")
var redisConnection = {
  port: redisConfig.port,
  host: redisConfig.host
}
var redisHost = redisConnection.host + ":" + redisConnection.port

var redis = require("redis");
var client = redis.createClient(redisConnection.port, redisConnection.host, {});



var userConnect = function(usercode, socketId, callback) {
  client.sadd("cs:user:sockets:" + usercode, socketId, function(){
    setUserOnline(usercode, callback);
  });
}
var userDisconnect = function(usercode, socketId, callback) {
  client.srem("cs:user:sockets:" + usercode, socketId, function(){
    userConnectionCount(usercode, function(err, count) {
      if(count < 1){
        setUserOffline(usercode, callback)
      }
    })
  });
}

var userConnectionCount = function(usercode, callback) {
  client.scard("cs:user:sockets:" + usercode, callback);
}
var userSockets = function(usercode, callback){
  client.smembers("cs:user:sockets:" + usercode, callback);
}
var clearSockets = function(usercode){
  userSockets(usercode, function(err, socketIds) {
    for(var i in socketIds){
      var socketId = socketIds[i];
      userDisconnect(usercode, socketId, function(){})
    }
  })
}


var setUserOnline = function(usercode, callback) {
  client.sadd("cs:online-users", usercode, callback);
}

var setUserOffline = function(usercode, callback) {
  client.srem("cs:online-users", usercode, callback);
}

var getOnlineUsers = function(callback){
  client.smembers("cs:online-users", callback);
}

getOnlineUsers(function(err, usercodes){
  for(var i in usercodes){
    clearSockets(usercodes[i])
  }
})


exports.onlineUsers = getOnlineUsers;
exports.connect = userConnect;
exports.disconnect = userDisconnect;
