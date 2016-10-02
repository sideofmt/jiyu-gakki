var date_obj = new Date();
var BPM = 140;
var interval = 7500.0/BPM; // 32分の間隔
var measureStart = date_obj.getTime();


var melodies = new Array();




var records = new Map();
var melodiesOsc = new Map();

var setIntervalId = setInterval(loop,interval);



/********************
    viewer
********************/

var app = angular.module('App', []);

app.controller('AppController', function MelodyListController($scope){
    //ここでModelとのやりとりなど。

    this.melodies = melodies;

    this.add = function() {

    };
    this.start = function(index) {
        
    }
    this.stop = function(index) {

    }
    this.delete = function(index) {
        this.melodies.splice(index,1);
    }
});

app.controller('DrumCtrl',function DrumListControler($scope){
    
    var MeasNum = 32;
    var InstNum = 4;
    this.drums = new Array(InstNum);
    
    this.drums[i] = {name: 'synbal', score: new Array(MeasNum)};
    this.drums[i] = {name: 'hi-hat', score: new Array(MeasNum)};
    this.drums[i] = {name: 'snare', score: new Array(MeasNum)};
    this.drums[i] = {name: 'kick', score: new Array(MeasNum)};
    
    for(var i=0; i<this.drums.length; i++){
        for(var j=0; j<MeasNum; j++){
            var temp = this.drums[i].score;
            temp = false;
        }
    }
    
    this.click = function(i,j){
        this.drums[i][1][j] = this.drums[i].get("score")[j] ? false : true;
    }
    
    
    
});


function onBPMClick(){
    try{
      BPM = parseInt(document.forms.id_form1.BPM.value);
      interval = 7500.0/BPM
      console.log("BPM is "+BPM);
    }catch(e){
      console.log(e);
    }
}

if(window.addEventListener){
    window.addEventListener('load',init);
}else if(window.attachEvent){
    window.attachEvent('onload',init);
}





/*********************
    logic
*********************/


var count = 0;
function loop(){
  if(count%2==1){
    for(var [key,value] of records){
      value.push(new Array());
    }
  }else{
    for(var k in isPlayList){
      var mel = melodies.get(k);
      console.log(mel);
      var note = mel[count/mel.length];
        if(note[1]){
          noteOn(k,note[0]);
        }else{
          noteOff(k,note[0]);
        }
      
    }
    
  }
  
  if(count%7==0){
    document.getElementById("tap").style.color = "red";
  }else{
    document.getElementById("tap").style.color = "black";
  }
  if(count%31==0)measureStart = date_obj.getTime();
  
  count++;
}


var Recording = function(){
  var melody;
  
  //Recording.prototype.recordingStart = function(){
    
    var now = date_obj.getTime() - measureStart;
    
    var mcount;
    var temp = interval*2;
    for(mcount=0; now>0; mcount++){
      now -= temp;
    }
    
    melody = new Array(mcount);
  //}
  Recording.prototype.getMelody = function(){
    return melody;
  }
  Recording.prototype.push = function(value){
    melody.push(value);
  }
  
}






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

var table = new Array();
for(var i=0; i<128; i++){
table.push(440.0 * Math.pow(2, (i-70)/12));
}

var MtoF = function(noteNumber){
return table[noteNumber];
};

var master = context.createGain();
master.connect(context.destination);


var oscs = new Map();


function init(){
var socket = io.connect();

//var melody_list = [];
var ctrls = new Map();


socket.on('connect', function(msg){
  socket.headbeatTimeout = 5000;
});

socket.on('greeting', function(data){
  console.log(data);
  socket.emit('greeting', "this is speaker");
});

socket.on('add_ctrl',function(id){
  console.log("add controller ID:"+id);
  var map = new Map();
  ctrls.set(id, map);
});

socket.on('cut_ctrl',function(id){
  console.log("cut controller ID:"+id);
  ctrls.delete(id);
  if(records.has(id)){
    melodies.push(records[id].getMelody());
    records.delete(id);
  }
});

socket.on('sendRecordingOn',function(id){
  console.log("recording start  id : "+id);
  records.set(id, new Recording());
});

socket.on('sendRecordingOff',function(id){
  console.log("recording stop  id : "+id);
  //console.log(records);
  if(records.has(id)){
    melodynum++;
    console.log(records.get(id));
    melodies.set(melodynum, records.get(id).getMelody());
    add(melodynum);
    records.delete(id);
  }
})


socket.on('sendNoteOn',function(msg){
  console.log("noteOn catch ID:" +msg[0] + " touchID:"+msg[1] + " key:"+msg[2]);
  
  var socketid = msg[0];
  var touchid = msg[1];
  var key = msg[2];
  
  
  
  var gain = context.createGain();
	    var osc = context.createOscillator();
		osc.connect(gain);
		gain.connect(master);
		osc.type = 'square';
  osc.frequency.value = MtoF(key);
  gain.gain.value = 0.5;
		osc.start();
		

	  oscs.set(socketid+touchid,osc);
		console.log(oscs);
		
		
		try{
		  if(records.has(socketid)){
		    var arr = records[socketid];
		    arr.push([key,true])
		  }
		}catch(e){
		  console.log();
		}
		
		
});


socket.on('sendNoteOff',function(msg){
  
  console.log("noteOff catch ID:" +msg[0] + " touchID:"+msg[1] + " key:"+msg[2]);
  
  var socketid = msg[0];
  var touchid = msg[1];
  var key = msg[2];
  
		  oscs.get(socketid+touchid).stop();
		  oscs.delete(socketid+touchid);
		  
		  try{
		  if(records.has(socketid)){
		    var arr = records[socketid];
		    arr.push([key,false])
		  }
		}catch(e){
		  console.log();
		}
  
});



};



function noteOn(id,key){
var gain = context.createGain();
	    var osc = context.createOscillator();
		osc.connect(gain);
		gain.connect(master);
		osc.type = 'square';
  osc.frequency.value = MtoF(key);
  gain.gain.value = 0.5;
		osc.start();
		melodiesOsc.set([id,key],osc);
}
function noteOff(id,key){
melodiesOsc.get([id,key]).stop();
		oscs.delete([id,key]);
}


