var socket = io.connect('http://localhost');
socket.on('ready', function (data) {
  console.log('ready');
});

sendMessage = function () {
  var message = $('message').val();
  if message.replace(" ", ""){
    socket.emit({message: message})
  }
}
