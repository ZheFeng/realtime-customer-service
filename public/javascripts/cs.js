(function(e){"use strict";var b=function(a,d,c){return 1===arguments.length?b.get(a):b.set(a,d,c)};b._document=document;b._navigator=navigator;b.defaults={path:"/"};b.get=function(a){b._cachedDocumentCookie!==b._document.cookie&&b._renewCache();return b._cache[a]};b.set=function(a,d,c){c=b._getExtendedOptions(c);c.expires=b._getExpiresDate(d===e?-1:c.expires);b._document.cookie=b._generateCookieString(a,d,c);return b};b.expire=function(a,d){return b.set(a,e,d)};b._getExtendedOptions=function(a){return{path:a&& a.path||b.defaults.path,domain:a&&a.domain||b.defaults.domain,expires:a&&a.expires||b.defaults.expires,secure:a&&a.secure!==e?a.secure:b.defaults.secure}};b._isValidDate=function(a){return"[object Date]"===Object.prototype.toString.call(a)&&!isNaN(a.getTime())};b._getExpiresDate=function(a,d){d=d||new Date;switch(typeof a){case "number":a=new Date(d.getTime()+1E3*a);break;case "string":a=new Date(a)}if(a&&!b._isValidDate(a))throw Error("`expires` parameter cannot be converted to a valid Date instance"); return a};b._generateCookieString=function(a,b,c){a=a.replace(/[^#$&+\^`|]/g,encodeURIComponent);a=a.replace(/\(/g,"%28").replace(/\)/g,"%29");b=(b+"").replace(/[^!#$&-+\--:<-\[\]-~]/g,encodeURIComponent);c=c||{};a=a+"="+b+(c.path?";path="+c.path:"");a+=c.domain?";domain="+c.domain:"";a+=c.expires?";expires="+c.expires.toUTCString():"";return a+=c.secure?";secure":""};b._getCookieObjectFromString=function(a){var d={};a=a?a.split("; "):[];for(var c=0;c<a.length;c++){var f=b._getKeyValuePairFromCookieString(a[c]); d[f.key]===e&&(d[f.key]=f.value)}return d};b._getKeyValuePairFromCookieString=function(a){var b=a.indexOf("="),b=0>b?a.length:b;return{key:decodeURIComponent(a.substr(0,b)),value:decodeURIComponent(a.substr(b+1))}};b._renewCache=function(){b._cache=b._getCookieObjectFromString(b._document.cookie);b._cachedDocumentCookie=b._document.cookie};b._areEnabled=function(){var a="1"===b.set("cookies.js",1).get("cookies.js");b.expire("cookies.js");return a};b.enabled=b._areEnabled();"function"===typeof define&& define.amd?define(function(){return b}):"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=b),exports.Cookies=b):window.Cookies=b})();


// Cookies.set('key', 'value');
// Cookies.get('key');
var csIdKey = "__jmd_cschat_csId"
var csId = Cookies.get(csIdKey);
if(!csId) {
  csId = "cs"
  Cookies.set(csIdKey, csId);
}

angular.module("customerService", ['ui.router', 'restangular', 'uuid4', 'ngCookies']);

angular.module('customerService').run(function(){})
angular.module('customerService').config(function(RestangularProvider){
  RestangularProvider.setBaseUrl('/api');
})


angular.module('customerService').controller("DeskCtrl", function($scope, Restangular){
  $scope.selectedUser = null;
  $scope.users = [];
  $scope.onlineUsercodes = [];
  $scope.userMessages = {};
  $scope.userUnread = {};
  $scope.historyMessages = {};
  // $scope.showHistory = {};
  $scope.message = "";

  var scrollBottom = function(){
    setTimeout(function(){
      $("html, body").animate({ scrollTop: $(document).height() }, 100);
    }, 100)
  }

  $scope.selectUser = function(user){
    $scope.selectedUser = user;
    $scope.userUnread[user.usercode] = 0;
    scrollBottom();
  }
  $scope.sendMessage = function(){
    usercode = $scope.selectedUser.usercode;
    message = $scope.message;
    if (sendMessage(message, usercode)){
      $scope.userMessages[usercode] = $scope.userMessages[usercode] || []
      $scope.userMessages[usercode].push({message: message});
      $scope.message = "";
      scrollBottom();
    }
  }
  $scope.messageHistory = function(){
    usercode = $scope.selectedUser.usercode;
    $scope.showHistory[usercode] = true;
    getChatHistory(usercode, function(messages){
        $scope.historyMessages[usercode] = $scope.historyMessages[usercode] || []
        for( var i = 0; i < messages.length; i++) {
          var message = messages[i];
          $scope.historyMessages[usercode].push(message);
        }

        scrollBottom();
    })
  }
  var getChatHistory = function (usercode) {
    Restangular.one("messages").getList("", {usercode: usercode}).then(function(messages){
        for( var i = 0; i < messages.length; i++) {
          var message = messages[i];
          $scope.historyMessages[usercode].push(message);
        }
    })
  }
  var updateUsers = function(users){
    for(var i in users){
      var user  = users[i];
      var usercode = user.usercode
      var userExist = _.findIndex($scope.users, { 'usercode': usercode }) >= 0;
      if(!userExist) {
        $scope.historyMessages[usercode] = []
        $scope.userMessages[usercode] = []
        $scope.userUnread[usercode] = 0
        $scope.users.push(user);
        getChatHistory(user.usercode);
      }
    }
  }
  var updateOnlineStatus = function(onlineUsercodes){
    for (var i in $scope.users) {
      var user = $scope.users[i];
      user.online = onlineUsercodes.indexOf(user.usercode) >= 0;
      if(user.username){
        user.displayName = user.username;
      }
      else{
        user.displayName = "匿名客户";
      }
    }
  }

  var socket = io.connect('');

  var sendMessage = function (message, usercode) {
    if (message.replace(" ", "") != ""){
      socket.emit("csMessage", {message: message, to: usercode})
      return true;
    }
    return false;
  }
  socket.on('ready', function (data) { });
  socket.on("clientMessage", function(data){
    $scope.userMessages[data.from].push(data);
    if (data.from != $scope.selectedUser.usercode) {
      $scope.userUnread[data.from]++;
    }
    $scope.$digest()
    scrollBottom();
  })
  socket.on("onlineUsers", function(data){
    updateUsers(data.users);
    updateOnlineStatus(data.online);
    if($scope.selectedUser == null && $scope.users.length > 0){
      if (data.online.length > 0){
        $scope.selectedUser = _.find($scope.users,function(user){ return data.online.indexOf(user.usercode) >= 0;});
      }
      else{
        $scope.selectedUser = $scope.users[0];
      }

    }
    $scope.$digest()
  })

})

