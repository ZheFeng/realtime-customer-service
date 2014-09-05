
var redisConnection = {
  port: 6379,
  host: "localdb"
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


var setUserOnline = function(usercode, callback) {
  client.sadd("cs:online-users", usercode, callback);
}

var setUserOffline = function(usercode, callback) {
  client.srem("cs:online-users", usercode, callback);
}

var getOnlineUsers = function(callback){
  client.smembers("cs:online-users", callback);
}


exports.onlineUsers = getOnlineUsers;
exports.connect = userConnect;
exports.disconnect = userDisconnect;
