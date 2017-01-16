// ********************************
// require
// ********************************

var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');

// user import
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



// ********************************
// define
// ********************************

var sockets = [];

var nscale = ["none","none"];
var nbpm = ["none","none"];

var speakers = new Array(); // socket

var player_sockets = new Array(); // socket
var players = new Map(); // new Player();
var notes = new Array(); // [id,key]
var melodyArray = new Array(); // [isPlaying, Melody()]

const default_interval = 33;
var interval = 0;
var interval_count = 0;
var note_divide = 4;
var note_divide_count = 0;

var loopid = setInterval(update, default_interval);




// ******************************
// main loop
// ******************************


function update(){
  
  
  if(interval_count >= interval){
    
    for (var i=0; i<notes.length; i++){
      
      var note = notes[i];
      var id = note[0];
      var key = note[1];
      var player = players.get(id);
      if(player.pushNote(key)){
        noteOn(id,key);
        
        /*
        var m = player.getMelody();
        if(m != null){
          m.push(true,key);
        }
        */
      }
      
    }
    
    players.forEach(function(player,id){
      var note = player.getNote();
      //var m = player.getMelody();
      
      for(var i =0; i<note.length; i++){
        var  key = note[i];
        if(!player.updateLimit(key)){
          noteOff(id,key);
          
          /*
          if(m != null){
            m.push(false,key);
          }
          */
        }
      }
      /*
      if(m != null){
        m.timeCount();
      }
      */
      
    });
    
    notes = new Array();
    
    // melody playing section
    /*
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
    */
    if(nbpm[0] != "none"){
      note_divide_count++;
      if(note_divide_count>=note_divide){
        note_divide_count = 0;
        broadcastSpeaker("clicker","");
      }
    }
    
    interval_count = 0;
  }else{
    players.forEach(function(player,id){
      var note = player.getNote();
      
      for(var i =0; i<note.length; i++){
        var  key = note[i];
        player.updateLimit2(key);
      }
      
    });
  }
  
  interval_count++;
  
  
}


// *************************************
// user function
// *************************************


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

function sendOctaveData(socket){
  players.forEach(function (player,key){
    var base = player.getBase();
    var id = key;
    socket.emit('octave_change',[id,base]);
  });
}



// ***********************************
// socket
// ***********************************


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
        sendOctaveData(socket);
        
        socket.emit("sendScale",nscale);
        socket.emit('sendBpm',nbpm);
        
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
  
  socket.on('octave_change',function(msg){
    var base = msg;
    if(player_sockets.indexOf(socket) != -1){
      var player = players.get(socket.id);
      player.setBase(base);
      broadcastSpeaker('octave_change',[socket.id,base]);
    }
  });
  
  
  socket.on('scale',function(msg){
    console.log("recieve changed scale : "+msg[0]+msg[1]);
    nscale = [msg[0],msg[1]];
    broadcastPlayer('sendScale',msg);
    broadcastSpeaker('sendScale',msg);
  });
  
  socket.on('bpm',function(msg){
    console.log("recieve changed : bpm"+msg[0]+" until "+msg[1]+" note");
    nbpm = [msg[0],msg[1]];
    
    var divide = 1;
    
    switch(nbpm[1]){
      case "whole":
        divide = 1;
        note_divide = 1;
        break;
      case "half":
        divide = 2;
        note_divide = 2;
        break;
      case "quarter":
        divide = 4;
        note_divide = 4;
        break;
      case "eighth":
        divide = 8;
        note_divide = 8;
        break;
      case "sixteenth":
        divide = 16;
        note_divide = 16;
        break;
      default:
    }
    
    switch(nbpm[0]){
      case "none":
        interval = 0;
        break;
      default:
        interval = Math.round( ( 60000/(nbpm[0]*(divide/4)) )/default_interval );
        
        console.log("interval is "+interval);
        break;
    }

    
    broadcastSpeaker('sendBpm',nbpm);
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




// ********************************
// broadcast function
// ********************************

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



// **********************************
// server listen
// **********************************

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});
