//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));

/*
server.on('request',function(req,res){
  console.log("request is throw");
  if(req.url == '/'){
    console.log("url is /");
    fs.readFile(__dirname + '/client/controller.html','UTF-8', function(err,data){
      if(err){
        res.writeHead(404,{'content-Type': 'text/plain'});
        res.write("not found");
        return res.end();
      }
      //res.writeHead(200,{'content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  }
  else if(req.url == '/speaker'){
    console.log("url is /speaker");
      fs.readFile(__dirname + '/client/speaker.html','UTF-8', function(err,data){
      if(err){
        res.writeHead(404,{'content-Type': 'text/plain'});
        res.write("not found");
        return res.end();
      }
      res.writeHead(200,{'content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  }
  else{
    res.writeHead(404,{'content-Type': 'text/plain'});
    res.write("not found");
    res.end();
  }
  
});
*/






io.set('heartbeat timeout',5000);
io.set('heartbeat interval',5000);

var sockets = [];
var speakers = [];

io.sockets.on('connection', function (socket) {
  
  var id = socket.id;
  
  sockets.push(socket);
  
  socket.emit('greeting',"connected");
  socket.on('greeting', function(data){
    speakers.push(socket);
  })
  
  broadcastSpeaker('add_ctrl',socket.id);
  

  
  
  socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      socket.emit('cut_ctrl',socket.id);
      
      speakers.splice(speakers.indexOf(socket), 1);
  });
  
  /*  
  socket.on('ctrl_data', function(msg){
    var data = [id,msg];
    io.sockets.emit('play_data',data);
  });
  */
  
  
  
  socket.on('noteOn',function(msg){
    var ID = socket.id;
    var touchID = msg[0];
    var key = msg[1];
    io.sockets.emit('sendNoteOn',[ID,touchID,key]);
  });
  
  /*
  socket.on('noteChange',function(msg){
    var ID = socket.id;
    var touchID = msg[0];
    var key = msg[1];
    io.sockets.emit('sendNoteChange',[ID,touchID,key]);
  });
  */
  
  socket.on('noteOff',function(msg){
    var ID = socket.id;
    var touchID = msg[0];
    var key = msg[1];
    io.sockets.emit('sendNoteOff',[ID,touchID,key]);
  });
  
  socket.on('recordingOn',function(msg){
    var ID = socket.id;
    io.sockets.emit('sendRecordingOn',ID);
  });
  
  socket.on('recordingOff',function(msg){
    var ID = socket.id;
    io.sockets.emit('sendRecordingOff',ID);
  });
  
  
    
});
  
function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

function broadcastSpeaker(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
