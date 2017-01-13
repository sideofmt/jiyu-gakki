
var melodies = new Map();

/********************
    viewer
********************/

angular.module('App', [])
.controller('AppController', function MelodyListController($scope){
    //ここでModelとのやりとりなど。

    this.melodies = melodies;

    this.start = function(index) {
        
    };
    this.stop = function(index) {
      
    };
    this.delete = function(index) {
        this.melodies.splice(index,1);
        
    };
})




if(window.addEventListener){
    window.addEventListener('load',init);
}else if(window.attachEvent){
    window.attachEvent('onload',init);
}









/*********************
    logic
*********************/




try{
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  // Create the instance of AudioContext
  context = new AudioContext();
  //master = context.createGain();
  //master.connect(context.destination);
  console.info("AudioContext is created");
  
}
catch(e) {
  alert('Web Audio API is not supported in this browser');
}

var master = context.createGain();
var panNode = context.createStereoPanner();
master.connect(context.destination);


var instruments = new Map();

function load_Inst(){
  Soundfont.instrument(context, './soundfont/acoustic_grand_piano-ogg.js').then(function (inst) {
    instruments.set('piano',inst);
  });
  Soundfont.instrument(context, './soundfont/synth_bass_1-ogg.js').then(function (inst) {
    instruments.set('bass',inst);
  });
  Soundfont.instrument(context, './soundfont/flute-ogg.js').then(function (inst) {
    instruments.set('flute',inst);
  });
  Soundfont.instrument(context, './soundfont/pad_3_polysynth-ogg.js').then(function (inst) {
    instruments.set('synth',inst);
  });
  Soundfont.instrument(context, './soundfont/string_ensemble_1-ogg.js').then(function (inst) {
    instruments.set('string',inst);
  });
  //Soundfont.instrument(context, './soundfont/synth_drum-ogg.js').then(function (inst) {
  //  instruments.set('drum',inst);
  //});
  instruments.set('drum',new Drum(context));
}






var socket = io.connect();



function noteOn(id,key){
  var player = players.get(id);
  var instrument_name = player.getInst();
  var instrument = instruments.get(instrument_name);
  //var instrument = instruments.get("piano");
  try{
    player.pushNote(key);
    if(instrument_name=="drum"){
      instrument.play(key);
    }else{
      var node = instrument.play(key,context.currentTime,{duration:3,release:2});
      player.setNode(key,node);
    }
    console.log("noteOn :"+key);
  }catch(e){
    console.error(e);
  }
}

function noteOff(id,key){
  var player = players.get(id);
  var instrument_name = player.getInst();
  //var instrument = instruments.get(player.getInst());
  try{
    player.deleteNote(key);
    if(instrument_name!="drum"){
      var node = player.getNode(key);
      node.stop(context.currentTime);
    }
    //instrument.stop(context.currentTime,[key]);
    console.log("noteOff :"+key);
  }catch(e){
    console.error(e);
  }
}

function scaleChange(base,scalename){
  socket.emit('scale',[base,scalename]);
  console.log("sent scale change : "+base+" "+scalename + " scale");
}





var indexList = new Array(); // player's index
var img_inst = new Array(8);
var img_note;

function loadImg(){
  img_inst[0] = new Image();
  img_inst[0].src = "img/gakki/keyboard1_red.png";
  img_inst[1] = new Image();
  img_inst[1].src = "img/gakki/keyboard2_blue.png";
  img_inst[2] = new Image();
  img_inst[2].src = "img/gakki/keyboard3_yellow.png";
  img_inst[3] = new Image();
  img_inst[3].src = "img/gakki/keyboard4_green.png";
  img_inst[4] = new Image();
  img_inst[4].src = "img/gakki/keyboard5_orange.png";
  img_inst[5] = new Image();
  img_inst[5].src = "img/gakki/keyboard6_purple.png";
  img_inst[6] = new Image();
  img_inst[6].src = "img/gakki/keyboard7_black.png";
  img_inst[7] = new Image();
  img_inst[7].src = "img/gakki/keyboard8_white.png";
  img_note = new Image();
  img_note.src = "img/onpu/11_8bu_onpu.png";
}






var players = new Map(); // [id,new Player()];
var noteOnList = new Array();
var p_noteOnList = new Array();







function Draw(canvas_name){

    var ctx;
    
    var windowIndex; // 画面番号
    var settingButton; // setting画面表示フラグ
    
    var width = 1000;
    var height = 400;
    
    document.getElementById(canvas_name).width = width;
    document.getElementById(canvas_name).height = height;
    
    function resize(){
        width = document.documentElement.clientWidth;
        height = document.documentElement.clientHeight;
    
        document.getElementById(canvas_name).width = document.documentElement.clientWidth -100;
        document.getElementById(canvas_name).height = document.documentElement.clientHeight -100;
        console.info("resize is called");
    }
    
    resize();
    
    window.onresize = resize;
    
    
    var canvas = document.getElementById(canvas_name);
    if (canvas.getContext){
      ctx = canvas.getContext('2d');
      windowIndex = 1;
      settingButton = false;
      loadImg();
      // 表示間隔とフレームごとに実行する関数を指定
      setInterval(draw, 33);
    }
      
    function draw(){
      
      
        // background
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        //ctx.globalCompositeOperation = "lighter";
      
        for(var [key,player] of players){
            
            //console.log("player:"+player);
            //console.log("player Index:"+player.getIndex());
            
            try{
              var index = player.getIndex();
              var x = 10+index*210;
              var y = 10;
              
              while(x+200>width){
                x -= width;
                y += 220;
              }
              
              // 楽器
              ctx.drawImage(img_inst[player.getIndex()],x,y);
              ctx.textAlign = "left";
              ctx.textBaseline = "top";
              ctx.font = "normal normal 30px MSゴシック";
              ctx.fillStyle = "rgb(0,0,0)";
              ctx.fillText(index,100+x,y);
              
              var notes = player.getNote();
              if(notes.length>0){
                // 音符
                ctx.drawImage(img_note,140+x,y);
              }
              
            }catch(e){
              console.error(e);
            }
        }
      
      
      
    }
    
}



var select = document.getElementById("scale");

select.onchange = function (){
  
  var base = document.getElementById("base");
  var scalename = document.getElementById("scalename");
  
  var index = base.selectedIndex;
  var index2 = scalename.selectedIndex;
  if(base.value == "none"){
    scalename.disabled = true;
  }else{
    scalename.disabled = false;
  }
  
  //if (index != 0 && index2 != 0){
    scaleChange(base.value,scalename.value);
  //}
}












function init(){
  
  load_Inst();
  var socket = io.connect();
  var ctrls = new Map();
  
  socket.on('connect', function(msg){
    socket.headbeatTimeout = 5000;
  });
  
  socket.on('greeting', function(data){
    console.log("from server : "+data);
    socket.emit('greeting', "speaker");
  });
  
  socket.on('update_data',function(ids){
    
    var idlist = new Array(); 
    
    for(var i=0; i<ids.length; i++){
      var id = ids[i][0];
      var index = ids[i][1];
      var inst = ids[i][2];
      console.log("[id:"+id+",index:"+index+",inst:"+inst+"]");
      
      var p;
      
      idlist.push(id);
      
      if(players.get(id) != undefined){
        console.log("update player:"+id);
        p = players.get(id);
        
        p.setIndex(index);
        p.setInst(inst);
        
      }else{
        console.log("add player:"+id);
        p = new Player(index,inst);
        players.set(id,p);
      }
    }
      
    players.forEach(function(player,id){
      if(!idlist.includes(id)){
        players.delete(id);
      }
    });
  });
  
  /*
  socket.on('disconnected',function(id){
    console.log("disconnected player ID:"+id);
    var player = players.get(id);
    player.remove();
    players.delete(id);
  });
  */

  
  
  
  // noteOn noteOff
  
  socket.on('noteOn',function(msg){
    console.log("noteOn ID:" +msg[0] + " key:"+msg[1]);
    
    var socketid = msg[0];
    var key = msg[1];
    
    var player = players.get(socketid);
    //player.setNote(key);
    noteOn(socketid, key);
  		
  });
  
  socket.on('noteOff',function(msg){
    console.log("noteOff ID:" +msg[0] + " key:"+msg[1]);
    
    var socketid= msg[0];
    var key = msg[1];
    
    noteOff(socketid,key);
  });
  
  
  socket.on('sendScale',function(msg){
    var nbase = msg[0];
    var nname = msg[1];
    
    var base = document.getElementById("base");
    var scalename = document.getElementById("scalename");
    
    switch(nbase){
      case 'none':
        base.selectedIndex = 0;
        scalename.disabled = true;
        break;
      case 'C':
        base.selectedIndex = 1;
        scalename.disabled = false;
        break;
      case 'C#':
        base.selectedIndex = 2;
        scalename.disabled = false;
        break;
      case 'D':
        base.selectedIndex = 3;
        scalename.disabled = false;
        break;
      case 'D#':
        base.selectedIndex = 4;
        scalename.disabled = false;
        break;
      case 'E':
        base.selectedIndex = 5;
        scalename.disabled = false;
        break;
      case 'F':
        base.selectedIndex = 6;
        scalename.disabled = false;
        break;
      case 'F#':
        base.selectedIndex = 7;
        scalename.disabled = false;
        break;
      case 'G':
        base.selectedIndex = 8;
        scalename.disabled = false;
        break;
      case 'G#':
        base.selectedIndex = 9;
        scalename.disabled = false;
        break;
      case 'A':
        base.selectedIndex = 10;
        scalename.disabled = false;
        break;
      case 'A#':
        base.selectedIndex = 11;
        scalename.disabled = false;
        break;
      case 'B':
        base.selectedIndex = 12;
        scalename.disabled = false;
        break;
      default:
        break;
    }
    
    switch(nname){
      case 'major':
        scalename.selectedIndex = 0;
        break;
      case 'minor':
        scalename.selectedIndex = 1;
        break;
      default:
        break;
    }
    
  });
  
  socket.on('instrument_change',function(msg){
    var id = msg[0];
    var inst = msg[1];
    
    var player = players.get(id);
    player.setInst(inst);
    
  });
  
}





class Player{
  constructor(index,instrument){
    this.index = index;
    this.instrument = instrument;
    this.note = [];
    this.node = new Map();
  }
  
  
  setIndex(index){
    this.index = index;
  }
  getIndex(){
      return this.index;
  }
  setInst(instrument){
    this.instrument = instrument;
  }
  getInst(){
    return this.instrument;
  }
  
  setNode(key,node){
    this.node.set(key,node);
  }
  getNode(key){
    return this.node.get(key);
  }
  
  
  
  pushNote(key){
    if(!this.note.includes(key)){
      this.note.push(key);
    }
    return;
  }
  getNote(){
    return this.note;
  }
  deleteNote(key){
    if(this.note.includes(key)){
      this.note.splice(this.note.indexOf(key), 1);
    }
  }
  
}



