(function(e){"use strict";var b=function(a,d,c){return 1===arguments.length?b.get(a):b.set(a,d,c)};b._document=document;b._navigator=navigator;b.defaults={path:"/"};b.get=function(a){b._cachedDocumentCookie!==b._document.cookie&&b._renewCache();return b._cache[a]};b.set=function(a,d,c){c=b._getExtendedOptions(c);c.expires=b._getExpiresDate(d===e?-1:c.expires);b._document.cookie=b._generateCookieString(a,d,c);return b};b.expire=function(a,d){return b.set(a,e,d)};b._getExtendedOptions=function(a){return{path:a&& a.path||b.defaults.path,domain:a&&a.domain||b.defaults.domain,expires:a&&a.expires||b.defaults.expires,secure:a&&a.secure!==e?a.secure:b.defaults.secure}};b._isValidDate=function(a){return"[object Date]"===Object.prototype.toString.call(a)&&!isNaN(a.getTime())};b._getExpiresDate=function(a,d){d=d||new Date;switch(typeof a){case "number":a=new Date(d.getTime()+1E3*a);break;case "string":a=new Date(a)}if(a&&!b._isValidDate(a))throw Error("`expires` parameter cannot be converted to a valid Date instance"); return a};b._generateCookieString=function(a,b,c){a=a.replace(/[^#$&+\^`|]/g,encodeURIComponent);a=a.replace(/\(/g,"%28").replace(/\)/g,"%29");b=(b+"").replace(/[^!#$&-+\--:<-\[\]-~]/g,encodeURIComponent);c=c||{};a=a+"="+b+(c.path?";path="+c.path:"");a+=c.domain?";domain="+c.domain:"";a+=c.expires?";expires="+c.expires.toUTCString():"";return a+=c.secure?";secure":""};b._getCookieObjectFromString=function(a){var d={};a=a?a.split("; "):[];for(var c=0;c<a.length;c++){var f=b._getKeyValuePairFromCookieString(a[c]); d[f.key]===e&&(d[f.key]=f.value)}return d};b._getKeyValuePairFromCookieString=function(a){var b=a.indexOf("="),b=0>b?a.length:b;return{key:decodeURIComponent(a.substr(0,b)),value:decodeURIComponent(a.substr(b+1))}};b._renewCache=function(){b._cache=b._getCookieObjectFromString(b._document.cookie);b._cachedDocumentCookie=b._document.cookie};b._areEnabled=function(){var a="1"===b.set("cookies.js",1).get("cookies.js");b.expire("cookies.js");return a};b.enabled=b._areEnabled();"function"===typeof define&& define.amd?define(function(){return b}):"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=b),exports.Cookies=b):window.Cookies=b})();


var chatContainer = $('<div style="position: fixed; background: #f0f0f0; top: 0px; left: 0px; width: 300px; height: 400px;"></div>')
var messageContainer = $('<div style="height: 360px;"></div>')
var form = $('<form id="messageFrom"></form>')
var input = $('<input type="text" />')
var submit = $('<button type="submit">发送</button>')

form.append(input);
form.append(submit);
chatContainer.append(messageContainer);
chatContainer.append(form);
$('body').append(chatContainer)



showMessage = function(message, isMine){
  var floatStyle = isMine ? "right" : "left";
  var html = $('<div style="float: ' + floatStyle + '">' + message + '</div><div style="content: \' \';display: table;clear: both;"></div>');
  messageContainer.append(html)
}

startSocket = function(){

  var socket = io.connect('http://localhost');
  socket.on('ready', function (data) {
  });

  socket.on("csMessage", function(data){
    // console.log(data);
    showMessage(data.message, false)
  })
  return socket;
}

createUser = function(newUserId, callback) {
  data = "{\"newUserId\": \"" + newUserId + "\"}"
  $.ajax({
    contentType: "application/json",
    dataType: "json",
    data: data,
    type: "POST",
    url: "/api/users",
    success: callback
  })
}

sendMessage = function (socket) {
  var message = input.val();
  if (message.replace(" ", "") != ""){
    input.val("")
    socket.emit("clientMessage", {message: message})
    showMessage(message, true)
  }
}

iniForm = function(){
  var socket = startSocket()


  form.submit(function(event){
    event.preventDefault()
    sendMessage(socket)
  })
}

start = function(){
  var clientIdKey = "__jmd_cschat_clientId"
  var clientId = Cookies.get(clientIdKey);
  if(!clientId) {
    clientId = 'Anonymous-' + Math.round(Math.random() * 1000) + '-' + (Date.now ? Date.now() : Math.round(Math.random() * 1000))
    createUser(clientId, function(){
      Cookies.set(clientIdKey, clientId);
      iniForm()
    })
  }
  else{
    iniForm()
  }
}
start()
