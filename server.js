//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');

// users import
var Melody = require('./src/melody.js');
var Player = require('./src/player.js');


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






//io.set('heartbeat timeout',5000);
//io.set('heartbeat interval',5000);

var sockets = [];

var nscale = ["none","none"];
var nbpm = ["none","none"];

var speakers = new Array(); // socket

var player_sockets = new Array(); // socket
var players = new Map(); // new Player();
var notes = new Array(); // [id,key]
var melodyArray = new Array(); // [isPlaying, Melody()]

setInterval(update, 33);

function update(){
  
  for (var i=0; i<notes.length; i++){
    
    var note = notes[i];
    var id = note[0];
    var key = note[1];
    var player = players.get(id);
    if(player.pushNote(key)){
      noteOn(id,key);
      
      var m = player.getMelody();
      if(m != null){
        m.push(true,key);
      }
    }
    
  }
  
  players.forEach(function(player,id){
    var note = player.getNote();
    var m = player.getMelody();
    
    for(var i =0; i<note.length; i++){
      var  key = note[i];
      if(!player.updateLimit(key)){
        noteOff(id,key);
        
        if(m != null){
          m.push(false,key);
        }
      }
    }
    if(m != null){
      m.timeCount();
    }
    
  });
  
  notes = new Array();
  
  // melody playing section
  for(var n=0; n<melodyArray.length; n++){
    if(melodyArray[n][0]){
      var mel = melodyArray[n][1];
      var mkey = mel.pop();
      var inst = mel.getInst();
      if(mkey != ''){
        broadcastSpeaker('melody_note',[inst,mkey]);
      }
    }
  }
  
}


function noteOn(id,key){
  console.log("noteOn is emitted : "+key);
  broadcastSpeaker('noteOn',[id,key]);
}

function noteOff(id,key){
  console.log("noteOff is emitted : "+key);
  broadcastSpeaker('noteOff',[id,key]);
}

function sendUpdateData(){
  var playerids = new Array();
  player_sockets.forEach(function (socket) {
    var p = players.get(socket.id);
    playerids.push([socket.id,p.getIndex(),p.getInst()]);
    // [socket.id, index, inst]
  });
  broadcastSpeaker("update_data",playerids);
}




io.sockets.on('connection', function (socket) {
  
  var id = socket.id;
  
  sockets.push(socket);
  
  socket.emit('greeting',"connected");
  socket.on('greeting', function(data){
    var str = data;
    switch(str){
      case 'speaker':
        speakers.push(socket);
        
        var playerids = new Array();
        player_sockets.forEach(function (socket) {
          var p = players.get(socket.id);
          playerids.push([socket.id,p.getIndex(),p.getInst()]);
          // [socket.id, index, inst]
        });
        socket.emit("update_data",playerids);
        
        socket.emit("sendScale",nscale);
        
        console.log("speaker added");
        break;
      case 'player':
        player_sockets.push(socket);
        var player = new Player("piano",0,0);
        players.set(socket.id,player);
        
        sendUpdateData();
        socket.emit('sendScale',nscale);
        socket.emit('player_index',player.getIndex());
        console.log("player added  id:"+socket.id);
        //console.log(players);
        break;
      default:
        console.log("unknown");
        break;
    }
  });

  
  
  socket.on('disconnect', function () {
      
      if(player_sockets.indexOf(socket) != -1){
        broadcastSpeaker("disconnected",id);
        player_sockets.splice(player_sockets.indexOf(socket), 1);
        
        var player = players.get(socket.id);
        player.remove();
        players.delete(socket.id);
        
        var playerids = new Array();
        player_sockets.forEach(function (socket) {
          var p = players.get(socket.id);
          playerids.push([socket.id,p.getIndex(),p.getInst()]);
          // [socket.id, index, inst]
        });
        broadcastSpeaker("update_data",playerids);
        
      }else if(speakers.indexOf(socket) != -1){
        speakers.splice(speakers.indexOf(socket), 1);
      }
  });
  
  
  socket.on('add_player',function(msg){
    player_sockets.push(id);
    io.sockets.socket(id).emit('added_player',"");
  });
  
  socket.on('player_index',function(msg){
    var id = msg[0];
    var data = msg[1];
    
    player_sockets.forEach(function (socket) {
      if(socket.id == id){
        socket.emit("player_index",data);
      }
    });
  });
  
  
  socket.on('noteOn',function(msg){
    var ID = socket.id;
    var key = msg;
    if(player_sockets.indexOf(socket) != -1){
      //console.log("ID :"+ID+"  key :"+key);
      if(notes.indexOf([ID,key]) == -1){
        notes.push([ID,key]);
      }
      //broadcastSpeaker('sendNoteOn',[ID,key]);
    }
  });
  socket.on('noteOff',function(msg){
    var ID = socket.id;
    var key = msg;
    console.log("noteOff recieve");
    if(player_sockets.indexOf(socket) != -1){
      console.log("noteOff ID :"+ID+"  key :"+key);
      var player = players.get(ID);
      //var note = player.getNote();
      player.limitZero(key);
      //broadcastSpeaker('sendNoteOff',[ID,key]);
    }
  });
  
  
  socket.on('data',function(msg){
    var ID = socket.id;
    if(player_sockets.indexOf(socket) != -1){
      broadcastSpeaker('data',[ID,msg]);
    }
  });
  
  
  socket.on('instrument_change',function(msg){
    
    var inst = msg;
    if(player_sockets.indexOf(socket) != -1){
      var player = players.get(socket.id);
      player.setInst(inst);
      broadcastSpeaker('instrument_change',[socket.id,inst]);
    }
  });
  
  
  socket.on('scale',function(msg){
    console.log("recieve changed scale : "+msg[0]+msg[1]);
    nscale = [msg[0],msg[1]];
    broadcastPlayer('sendScale',msg);
    broadcastSpeaker('sendScale',msg);
  });
  
  socket.on('bpm',function(msg){
    console.log("recieve changed : bpm"+msg[0]+" "+msg[1]+"音符");
    nbpm = [msg[0],msg[1]];
    broadcastSpeaker('sendBpm',msg);
  });
  
  socket.on('Rec',function(msg){
    
    var player = players.get(socket.id);
    
    switch(msg){
      case 'on':
        if(player.getMelody() != null){
          console.error("melody is already existed.");
        }else{
          var instname = player.getInst();
          var m = new Melody(player.getIndex() +":"+instname,instname);
          player.setMelody(m);
        }
        break;
        
      case 'off':
        if(player.getMelody == null){
          console.error("melody is null");
        }else{
          var melody = player.getMelody();
          player.setMelody(null);
          melodyArray.push([false,melody]);
        }
        break;
        
      default:
        break;
    }
  });
  
  socket.on('play_melody',function(msg){
    var index = msg[0];
    var msg = msg[1]; // true is start, false is stop
    
    try{
      melodyArray[index][0] = msg;
    }catch(e){
      console.error(e);
    }
  });
  
    
});
  
function broadcastPlayer(event, data) {
  player_sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

function broadcastSpeaker(event, data) {
  speakers.forEach(function (socket) {
    socket.emit(event, data);
  });
}


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});
