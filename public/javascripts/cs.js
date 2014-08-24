var socket = io.connect('http://localhost');
  socket.on('ready', function (data) {
    console.log('ready');
  });
