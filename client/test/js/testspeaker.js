
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
});




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
  Soundfont.instrument(context, '../soundfont/acoustic_grand_piano-ogg.js').then(function (inst) {
    instruments.set('piano',inst);
  });
  Soundfont.instrument(context, '../soundfont/synth_bass_1-ogg.js').then(function (inst) {
    instruments.set('bass',inst);
  });
  Soundfont.instrument(context, '../soundfont/flute-ogg.js').then(function (inst) {
    instruments.set('flute',inst);
  });
  Soundfont.instrument(context, '../soundfont/pad_3_polysynth-ogg.js').then(function (inst) {
    instruments.set('synth',inst);
  });
  Soundfont.instrument(context, '../soundfont/string_ensemble_1-ogg.js').then(function (inst) {
    instruments.set('strings',inst);
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

function bpmChange(sbpm,score){
  socket.emit('bpm',[sbpm,score]);
  console.log("sent bpm change : bpm"+sbpm+" until "+score+" note");
}





var indexList = new Array(); // player's index
var img_inst = new Array(8);
var img_map = new Map();
var img_note;

function loadImg(){
  img_inst[0] = new Image();
  img_inst[0].src = "../img/gakki/keyboard1_red.png";
  img_inst[1] = new Image();
  img_inst[1].src = "../img/gakki/keyboard2_blue.png";
  img_inst[2] = new Image();
  img_inst[2].src = "../img/gakki/keyboard3_yellow.png";
  img_inst[3] = new Image();
  img_inst[3].src = "../img/gakki/keyboard4_green.png";
  img_inst[4] = new Image();
  img_inst[4].src = "../img/gakki/keyboard5_orange.png";
  img_inst[5] = new Image();
  img_inst[5].src = "../img/gakki/keyboard6_purple.png";
  img_inst[6] = new Image();
  img_inst[6].src = "../img/gakki/keyboard7_black.png";
  img_inst[7] = new Image();
  img_inst[7].src = "../img/gakki/keyboard8_white.png";
  img_note = new Image();
  img_note.src = "../img/onpu/11_8bu_onpu.png";
  
  var img = new Image();
  img.src = "../img/gakki/drumset.png";
  img_map.set("drum",img);
  img = new Image();
  img.src = "../img/gakki/electone.png";
  img_map.set("synth",img);
  img = new Image();
  img.src = "../img/gakki/music_base.png";
  img_map.set("bass",img);
  img = new Image();
  img.src = "../img/gakki/music_flute.png";
  img_map.set("flute",img);
  img = new Image();
  img.src = "../img/gakki/music_piano.png";
  img_map.set("piano",img);
  img = new Image();
  img.src = "../img/gakki/music_violin.png";
  img_map.set("strings",img);
  
}






var players = new Map(); // [id,new Player()];
var noteOnList = new Array();
var p_noteOnList = new Array();





var width = 750;
var height = 220;
var canvas_name;

function Draw(canvas_n){

    var ctx;
    canvas_name = canvas_n;
    
    var windowIndex; // 画面番号
    var settingButton; // setting画面表示フラグ
    

    
    document.getElementById(canvas_name).width = width;
    document.getElementById(canvas_name).height = height;
    
    /*
    function resize(){
        width = document.documentElement.clientWidth;
        height = document.documentElement.clientHeight;
    
        //document.getElementById(canvas_name).width = document.documentElement.clientWidth -100;
        //document.getElementById(canvas_name).height = document.documentElement.clientHeight -100;
        console.info("resize is called");
    }
    
    resize();
    
    window.onresize = resize;
    */
    
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
      
      var i=0;
      for(var [key,player] of players){
          
          //console.log("player:"+player);
          //console.log("player Index:"+player.getIndex());
          
          try{
            var index = player.getIndex();
            var x = 10;
            var y = 10+210*i;
            
            
            // 楽器
            ctx.drawImage(img_map.get(player.getInst()),x,y,200,200);
            
            // インデックスの表示
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            
            ctx.font = "normal normal 30px MSゴシック";
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.fillText(index,60+x,y);
            
            var notes = player.getNote();
            if(notes.length>0){
              // 音符
              ctx.drawImage(img_note,140+x,y);
            }
            
            
            // 鍵盤の描画の下準備
            var pushKey = [[false,false,false,false,false,false,false,false,false,false,false,false],
                          [false,false,false,false,false,false,false,false,false,false,false,false]];
                          // [0,2,4,5,7,9,11,1,3,6,8,10]; 
            var base = player.getBase();
            for(var t=0; t<notes.length; t++){
              var pushed = notes[t] - base;
              var stage = 0;
              if(pushed>11){
                pushed -= 12;
                stage = 1;
              }
              
              switch(pushed){
                case 0:
                  pushed = 0;
                  break;
                case 1:
                  pushed = 7;
                  break;
                case 2:
                  pushed = 1;
                  break;
                case 3:
                  pushed = 8;
                  break;
                case 4:
                  pushed = 2;
                  break;
                case 5:
                  pushed = 3;
                  break;
                case 6:
                  pushed = 9;
                  break;
                case 7:
                  pushed = 4;
                  break;
                case 8:
                  pushed = 10;
                  break;
                case 9:
                  pushed = 5;
                  break;
                case 10:
                  pushed = 11;
                  break;
                case 11:
                  pushed = 6;
                  break;
                default:
                break;
              }
              pushKey[1-stage][pushed] = true;
            }
            
            
            
            // オクターブの表示 24,36,48,60,72,84
            var xstart = 270;
            var ystart = 60+210*i;
            
            
            y = 0;
            switch(base){
              case 24:
                y = 100;
                break;
              case 36:
                y = 80;
                break;
              case 48:
                y = 60;
                break;
              case 60:
                y = 40;
                break;
              case 72:
                y = 20;
                break;
              //case 84:
              //  y = 0;
              //  break;
              default:
                break;
            }
            
            ctx.fillStyle = "rgb(0,0,100)";
            ctx.fillRect(xstart,ystart + y,20,20);
            
            
            
            
            
            xstart = 300;
            //ystart = 60+210*i;

            
            // 鍵盤
            for(var m=0; m<2; m++){
              x = 0;
              var count = 0;
              for(var n=0; n<7; n++){
                if(pushKey[m][count]){
                  ctx.fillStyle = "rgb(255,0,0)";
                  ctx.fillRect(xstart+x,ystart+60*m,40,60);
                }
                ctx.strokeStyle = "rgb(0,0,0)";
                ctx.strokeRect(xstart+x,ystart+60*m,40,60);
                x+=40;
                count++;
              }
              x = 20;
              for(n=0; n<5; n++){
                if(pushKey[m][count]){
                  ctx.fillStyle = "rgb(200,0,0)";
                }else{
                  ctx.fillStyle = "rgb(0,0,0)";
                }
                ctx.fillRect(xstart+x+10,ystart+60*m,20,40);
                ctx.strokeStyle = "rgb(0,0,0)";
                ctx.strokeRect(xstart+x+10,ystart+60*m,20,40);
                
                if(n==1)x+=80;
                else x+=40;
                
                count++;
              }
              
            }
            
            
          }catch(e){
            console.error(e);
          }
          i++;
      }
      
      
      
    }
    
}



var selectnote = document.getElementById("scale");

selectnote.onchange = function (){
  
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
};

var selectbpm = document.getElementById("rythm");

selectbpm.onchange = function (){
  
  var sbpm = document.getElementById("bpm");
  var score = document.getElementById("score");
  
  var index = sbpm.selectedIndex;
  var index2 = score.selectedIndex;
  if(sbpm.value == "none"){
    score.disabled = true;
  }else{
    score.disabled = false;
  }
  bpmChange(sbpm.value,score.value);
};










function init(){
  
  load_Inst();
  var socket = io.connect();
  var ctrls = new Map();
  
  
  var bpmMin = 60;
  var bpmMax = 210;
  
  for(var i=bpmMin; i<=bpmMax; i++){
    
    // <select id="select"> を取得
    var select = document.getElementById('bpm');
    // <option> 要素を宣言
    var option = document.createElement('option');
     
    option.setAttribute('value', i);
    option.innerHTML = i;
     
    // 上記で設定した <option value=""></option> を、
    // <select> 内に追加する
    select.appendChild(option);
  }
  
  socket.on('connect', function(msg){
    socket.headbeatTimeout = 5000;
  });
  
  socket.on('greeting', function(data){
    console.log("from server : "+data);
    socket.emit('greeting', "speaker");
    document.getElementById("socket_state").textContent="connect";
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
    
    height = 10+210*idlist.length;
    document.getElementById(canvas_name).height = height;
    
  });
  
  
  socket.on('disconnect',function(){
    document.getElementById("socket_state").textContent="disconnect";
  });

  
  
  
  // noteOn noteOff
  
  socket.on('noteOn',function(msg){
    console.log("noteOn ID:" +msg[0] + " key:"+msg[1]);
    
    var socketid = msg[0];
    var key = msg[1];
    var time = msg[2];
    
    //var player = players.get(socketid);
    //player.setNote(key);
    noteOn(socketid, key);
  	
  	socket.emit('note_back',[socketid,time,"noteOn"]);
  		
  });
  
  socket.on('noteOff',function(msg){
    console.log("noteOff ID:" +msg[0] + " key:"+msg[1]);
    
    var socketid= msg[0];
    var key = msg[1];
    var time = msg[2];
    
    noteOff(socketid,key);
    
    socket.emit('note_back',[socketid,time,"noteOff"]);
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
  
  
  socket.on('sendBpm',function(msg){
    var nbpm = msg[0];
    var nscore = msg[1];
    
    console.log("from server : "+nbpm+" bpm until "+nscore+" note");
    
    var bpm = document.getElementById("bpm");
    var score = document.getElementById("score");
    
    switch(nbpm){
      case 'none':
        bpm.selectedIndex = 0;
        score.disabled = true;
        break;
      default:
        bpm.selectedIndex = nbpm-bpmMin+1;
        score.disabled = false;
        break;
    }
    
    switch(nscore){
      case 'whole':
        score.selectedIndex = 0;
        break;
      case 'half':
        score.selectedIndex = 1;
        break;
      case 'quarter':
        score.selectedIndex = 2;
        break;
      case 'eighth':
        score.selectedIndex = 3;
        break;
      case 'sixteenth':
        score.selectedIndex = 4;
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
  
  socket.on('octave_change',function(msg){
    var id = msg[0];
    var base = msg[1];
    
    var player = players.get(id);
    player.setBase(base);
    
  });
  
  
  socket.on("clicker",function(msg){
    
    document.getElementById("clicker").style.color = "red";
    setTimeout(function(){
      document.getElementById("clicker").style.color = "black";
    }, 100);
    
  });
  
  
  
}





class Player{
  constructor(index,instrument){
    this.index = index;
    this.instrument = instrument;
    this.note = [];
    this.node = new Map();
    this.base = 60;
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
  
  setBase(base){
    this.base = base;
  }
  getBase(){
    return this.base;
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



