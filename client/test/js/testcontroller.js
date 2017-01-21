

/*************************
    logic
*************************/




var width_div = 12;
var height_div = 2;
var keyMap = [];
var baseKey = 60;
var canvas_name;

var touchInput = new Map();


var scales = new Map();

var nscale = [true,true,true,true,true,true,true,true,true,true,true,true];
var nscalestr = "none";
var drummap = [36,40,39,43,45,47,35,42,46,51,49,57];


scales.set("none",            [true,true, true,true, true,true,true, true,true, true,true, true]);
scales.set("major",           [true,false,true,false,true,true,false,true,false,true,false,true]);
scales.set("minor",           [true,false,true,true,false,true,false,true,true,false,true,false]);
scales.set("major pentatonic",[true,false,true,false,true,false,false,true,false,true,false,false]);
scales.set("minor pentatonic",[true,false,false,true,false,true,false,true,false,false,true,false]);
scales.set("harmonic minor",  [true,false,true,true,false,true,false,true,true,false,false,true]);
scales.set("melodic minor",   [true,false,true,true,false,true,false,true,false,true,false,true]);
scales.set("blues major",     [true,false,true,true,true,true,true,true,true,true,false,false]);
scales.set("blues minor",     [true,false,false,true,false,true,true,true,false,false,true,false]);


function nameToI(name){
    switch(name){
        case "C":
            return 0;
        case "C#":
            return 1;
        case "D":
            return 2;
        case "D#":
            return 3;
        case "E":
            return 4;
        case "F":
            return 5;
        case "F#":
            return 6;
        case "G":
            return 7;
        case "G#":
            return 8;
        case "A":
            return 9;
        case "A#":
            return 10;
        case "B":
            return 11;
    }
}





var TouchSynth = function(canvasname,io){
    
    var socket = io;
    
    var context;
    var master;
    var oscillator;
    var canvas;
    var windowsize;
    
    
    var instrumentList = ["piano","bass","flute","synth","strings","drum"];
    var instIndex = 0;
    var player_index = null;
    
    var octaveList = [24,36,48,60,72,84]; // 21 < key < 108
    var octaveIndex = 3;
    
    canvas_name = canvasname;
    
    var touchXY = new Map();
    
    //window.onload = function init()
    //Scroll_Event();
    windowsize = new WindowSize();
    canvas = new Draw(canvas_name, windowsize);
    
    if(document.addEventListener){
    
        if(window.ontouchstart === null){
            TouchInput();
        }else{
            MouseInput();
        }
    
    }
    
    function sendNoteOn(key){
        var time = Test.start();
        socket.emit('noteOn',[key,time]);
    }
    
    function sendNoteOff(key){
        var time = Test.start();
        socket.emit('noteOff',[key,time]);
        //console.log("send noteOff");
    }
    
    function sendInstChange(instrument){
        socket.emit('instrument_change',instrument);
    }
    
    function sendOctaveChange(base){
        socket.emit('octave_change',base);
    }
    
    
    socket.on('greeting', function(data){
        console.log("from server : "+data);
        socket.emit('greeting', "player");
    });
    
    socket.on('sendScale', function(msg){
        var base = msg[0];
        var scalename = msg[1];
        console.log("scale is changed : "+base+" "+scalename+" scale");
        
        if(msg[0] == "none"){
            nscale = [true,true, true,true, true,true,true, true,true, true,true, true];
            nscalestr = "none";
        }else{
        
            var start = nameToI(base);
            var scale = scales.get(scalename);
            nscalestr = base+" "+scalename+" scale";
        
            console.log("scale set");
            for(var i=0; i<nscale.length; i++){
                    var num = start + i;
                    if(num>11)num -= 12;
                    nscale[num] = scale[i];
                    //console.log(num+": "+scale[i]);
            }
        }
    });
    
    socket.on('player_index', function(msg){
       
       console.log("player_index : "+player_index);
       player_index = msg;
        
    });
    
    
    socket.on('note_back',function(msg){
        var time = msg[0];
        var sid = msg[1];
        var note = msg[2];
        
        var ntime = Test.stop(time);
        
        if(time!=null){
            socket.emit('write_log',[ntime,sid,note]);
        }
    });
    

    
    
    function TouchInput()
    {
        console.info("touchInput id called");
		// ------------------------------------------------------------
		// タッチすると実行される関数
		// ------------------------------------------------------------
		function TouchStartEventFunc(e){
			// TouchList オブジェクトを取得
			var touch_list = e.changedTouches;
			
			// 中身に順番にアクセス
			var i;
			var num = touch_list.length;
			for(i=0;i < num;i++){

				// Touch オブジェクトを取得
				var touch = touch_list[i];
				
				var id = touch.identifier;
                console.log("touchID: "+id);

				// 出力テスト
				console.log(touch);
				console.log("clientX:" + touch.clientX);
				console.log("clientY:" + touch.clientY);
				var x = touch.clientX;
				var y = touch.clientY;
				
				touchInput.set(id,[x,y]);
				
			};
		};
		function TouchSlideEventFunc(e){
			// TouchList オブジェクトを取得
			var touch_list = e.changedTouches;

			// 中身に順番にアクセス
			var i;
			var num = touch_list.length;
			for(i=0;i < num;i++){

				// Touch オブジェクトを取得
				var touch = touch_list[i];
				
				var id = touch.identifier;
                console.log("touchID: "+id);
                
				// 出力テスト
				console.log(touch);
				
				console.log("clientX:" + touch.clientX);
				console.log("clientY:" + touch.clientY);
				
				var x = touch.clientX;
				var y = touch.clientY;
				
				touchInput.set(id,[x,y]);
			}
		};
		function TouchEndEventFunc(e){
			// TouchList オブジェクトを取得
			var touch_list = e.changedTouches;

			// 中身に順番にアクセス
			var i;
			var num = touch_list.length;
			for(i=0;i < num;i++){
			    
				// Touch オブジェクトを取得
				var touch = touch_list[i];

                var id = touch.identifier;
                console.log("touchID: "+id);

				// 出力テスト
				console.log(touch);
				
				var x = touch.clientX;
				var y = touch.clientY;
				
				touchInput.delete(id);
			}
		};

		// ------------------------------------------------------------
		// リッスンを開始する
		// ------------------------------------------------------------
		// タッチを開始すると実行されるイベント
		document.addEventListener("touchstart",TouchStartEventFunc);

		// タッチしたまま平行移動すると実行されるイベント
		document.addEventListener("touchmove",TouchSlideEventFunc);

		// タッチを終了すると実行されるイベント
		document.addEventListener("touchend",TouchEndEventFunc);
		document.addEventListener("touchcancel",TouchEndEventFunc);
    }; 
    
    function MouseInput()
    {
        console.info("mouseInput id called");
        var id = 0;
        var mousepress = false;
        var osc;
        var gain;
        var prekey;
        
        function MousedownEventFunc(e){
            var x = e.clientX;
	        var y = e.clientY;
	        
	        mousepress = true;
	        
	        touchInput.set(id,[x,y]);
			
        };
        
        function MousemoveEventFunc(e){
            if(mousepress){
                var x = e.clientX;
    	        var y = e.clientY;
    	        
    	        touchInput.set(id,[x,y]);
            }
        };
        function MouseupEventFunc(e){
            if(mousepress){
                var x = e.clientX;
    	        var y = e.clientY;
    	        
	            mousepress = false;
	            
	            console.log("id:"+id);
	            
	            touchInput.delete(id);
            }
        };
        
        document.addEventListener("mousedown",MousedownEventFunc);
		document.addEventListener("mousemove",MousemoveEventFunc);
		document.addEventListener("mouseup",MouseupEventFunc);
		document.addEventListener("mouseout",MouseupEventFunc);
    };
    

    
    
    
    function Draw(canvas_name,swindowsize){
    
        var ctx;
        
        var windowIndex; // 画面番号
        var settingButton; // setting画面表示フラグ
        var button = [false,false];
        var keyPushed = [[false,false,false,false,false,false,false,false,false,false,false,false],
                         [false,false,false,false,false,false,false,false,false,false,false,false]];
        var drumPushed = [[false,false,false,false,false,false],
                          [false,false,false,false,false,false]];
                         
        
        var canvas = document.getElementById(canvas_name);
            if (canvas.getContext){
                ctx = canvas.getContext('2d');
                windowIndex = 1;
                settingButton = false;
                // 表示間隔とフレームごとに実行する関数を指定
                setInterval(draw, 33);
            }
        var windowsize = swindowsize;
        
        
        function draw(){
            
            var width = windowsize.getWidth();
            var height = windowsize.getHeight();
            
            
            
            
            // background
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "#333333";
            ctx.fillRect(0, 0, width, height);
            //ctx.globalCompositeOperation = "lighter";
            
            
            
            
            
            switch(windowIndex){
                case 0:
                    
                    /*
                    設定画面
                    */
                    
                    
                    ctx.fillStyle = "#888888";
                    ctx.fillRect(0, height/4, width, height*3/4);
                    
                    
 
                    
                    if(isPress(width/12+80, height/2, 180, 40)){
                        ctx.fillStyle = "rgb(200,100,100)";
                        button[0] = true;
                    }else{
                        if(button[0]){
                            instIndex++;
                            if(instIndex>=instrumentList.length){
                                instIndex -= instrumentList.length;
                            }
                            sendInstChange(instrumentList[instIndex]);
                        }
                        ctx.fillStyle = "rgb(255,255,255)";
                        button[0] = false;
                    }
                    
                    ctx.fillRect(width/12+80, height/2, 180, 40);
                    var str = instrumentList[instIndex];
                    
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top";
                    ctx.font = "normal normal 30px MSゴシック";
                    ctx.fillStyle = "rgb(255,255,255)";
                    ctx.fillText("楽器",width/12,height/2+5);
                    ctx.fillStyle = "rgb(0,0,0)";
                    ctx.fillText(str,width/12+100, height/2);
                    
                    /*
                    ctx.fillStyle = "rgb(255,100,100)";
                    ctx.strokeStyle = "rgb(0,0,0)";
                    
                    ctx.fillRect(width/12, height*3/4, width/12, height/8);
                    ctx.strokeRect(width/12, height*3/4, width/12, height/8);
                    
                    ctx.fillStyle = '#000000';
                    ctx.textAlign = "left";
                    ctx.font = "normal normal 15px MSゴシック";
                    ctx.fillText("Octave",width/6,height*3/4);
                    
                    */
                    if(isPress(width/12+80, height/2+100, 180, 40)){
                        ctx.fillStyle = "rgb(200,100,100)";
                        button[1] = true;
                    }else{
                        if(button[1]){
                            octaveIndex++;
                            if(octaveIndex>=octaveList.length)octaveIndex -= octaveList.length;
                            baseKey = octaveList[octaveIndex];
                            sendOctaveChange(baseKey);
                        }
                        ctx.fillStyle = "rgb(255,255,255)";
                        button[1] = false;
                    }
                    
                    ctx.fillRect(width/12+80, height/2+100, 180, 40);
                    
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top";
                    ctx.font = "normal normal 30px MSゴシック";
                    ctx.fillStyle = "rgb(255,255,255)";
                    ctx.fillText("オクターブ",width/12,height/2+5+100);
                    ctx.fillStyle = "rgb(0,0,0)";
                    ctx.fillText(octaveIndex-3,width/12+100, height/2+100);
                    
                    
                    
                    

                    break;
                       
                    
                case 1:
                    
                    
                    /*
                    鍵盤
                    */
                    
                    var xstart = 0;
                    var ystart = height/4;
                    
                    var rectx = width/12;
                    var recty = height*3/8;
                    
                    for(var x=0; x<12; x++){
                        for(var y=0; y<2; y++){
                            
                            if(!nscale[x]){
                                ctx.fillStyle = "rgb(100,100,100)";
                                ctx.strokeStyle = "rgb(200,200,200)";
                                keyPushed[y][x] = false;
                            }else{
                                var key = baseKey + x + (1-y)*12;
                                if(isPress(x*rectx + xstart,y*recty + ystart,rectx,recty)){    // 鍵が押されているかどうか
                                    if(x==1||x==3||x==6||x==8||x==10){  // 黒鍵であるかどうか
                                        // 黒鍵
                                        ctx.fillStyle = "rgb(200,0,0)";
                                        ctx.strokeStyle = "rgb(200,200,200)";
                                    }else{
                                        // 白鍵
                                        ctx.fillStyle = "rgb(255,100,100)";
                                        ctx.strokeStyle = "rgb(200,200,200)";
                                    }
                                    
                                    sendNoteOn(key);
                                    
                                    keyPushed[y][x] = true;
                                }else{
                                    if(x==1||x==3||x==6||x==8||x==10){  // 黒鍵であるかどうか
                                        // 黒鍵
                                        ctx.fillStyle = "rgb(0,0,0)";
                                        ctx.strokeStyle = "rgb(200,200,200)";
                                    }else{
                                        // 白鍵
                                        ctx.fillStyle = "rgb(255,255,255)";
                                        ctx.strokeStyle = "rgb(200,200,200)";
                                    }
                                    
                                    if(keyPushed[y][x]){
                                        sendNoteOff(key);
                                    }
                                    
                                    
                                    keyPushed[y][x] = false;
                                }
                            }
                            ctx.fillRect(x*rectx + xstart, y*recty + ystart, rectx, recty);
                            ctx.strokeRect(x*rectx + xstart, y*recty + ystart, rectx, recty);
                        }
                    }
                    break;
                            
                    
                case 2:
                    
                    /*
                    ドラムマシン
                    */
                    
                    var xstart = 0;
                    var ystart = height/4;
                    
                    var rectx = width/6;
                    var recty = height*3/8;
                    
                    for(var x=0; x<6; x++){
                        for(var y=0; y<2; y++){
                            if(isPress(x*rectx + xstart,y*recty + ystart,rectx,recty)){    // 鍵が押されているかどうか
                                ctx.fillStyle = "rgb(255,100,100)";
                                ctx.strokeStyle = "rgb(200,200,200)";
                                sendNoteOn(drummap[y*6+x]);
                                drumPushed[y][x] = true;;
                            }else{
                                ctx.fillStyle = "rgb(255,255,255)";
                                ctx.strokeStyle = "rgb(200,200,200)";
                                
                                if(drumPushed[y][x]){
                                    sendNoteOff(drummap[y*6+x]);
                                }
                                
                                drumPushed[y][x] = false;
                            }
                            ctx.fillRect(x*rectx+ xstart, y*recty+ ystart, rectx, recty);
                            ctx.strokeRect(x*rectx+ xstart, y*recty+ ystart, rectx, recty);
                        }
                    }
                    break;
                    
                default:
                    break;
                
            }
            
            
            
            /*
            情報バー
            */
            
            var pushstr = "音名: ";
            var scalestr = "音階: "+nscalestr;
            var indexstr = "番号: ";
            
            if(windowIndex == 1){
                for(var x=0; x<12; x++){
                    for(var y=0; y<2; y++){
                        if(isPress(x*rectx + xstart,y*recty + ystart,rectx,recty) && nscale[x]){ 
                            switch(x){
                                case 0:
                                    pushstr += "C ";
                                    break;
                                case 1:
                                    pushstr += "C# ";
                                    break;
                                case 2:
                                    pushstr += "D ";
                                    break;
                                case 3:
                                    pushstr += "D# ";
                                    break;
                                case 4:
                                    pushstr += "E ";
                                    break;
                                case 5:
                                    pushstr += "F ";
                                    break;
                                case 6:
                                    pushstr += "F# ";
                                    break;
                                case 7:
                                    pushstr += "G ";
                                    break;
                                case 8:
                                    pushstr += "G# ";
                                    break;
                                case 9:
                                    pushstr += "A ";
                                    break;
                                case 10:
                                    pushstr += "A# ";
                                    break;
                                case 11:
                                    pushstr += "B ";
                                    break;
                            }
                        }
                    }
                }
            }
            
            if(player_index != null){
                indexstr += player_index;
            }
            

            ctx.fillStyle = "rgb(70,70,70)";
            ctx.fillRect(0,20, 200, 20);
            ctx.fillRect(0,50, 200, 20);
            ctx.fillRect(0,80, 200, 20);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "normal normal 15px MSゴシック";
            ctx.fillText(pushstr,0,20);
            ctx.fillText(scalestr,0,50);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "normal normal 15px MSゴシック";
            ctx.fillText(+player_index,0,80);
            
            
            
        
            /*
            設定
            */
            
            
            if(isPress(width*13/16, height*3/32, ctx.measureText("設定").width, 20 )){
                ctx.fillStyle = "#444444";
                settingButton = true;
            }else{
                if(settingButton){
                    switch(windowIndex){
                        case 0:
                            if(instIndex == instrumentList.length-1){
                                windowIndex = 2;
                            }else{
                                windowIndex = 1;
                            }
                            break;
                        case 1:
                            windowIndex = 0;
                            break;
                        case 2:
                            windowIndex = 0;
                            break;
                    }

                }
                ctx.fillStyle = "#222222";
                settingButton = false;
            }
            
            //ctx.fillStyle = '#444444';
            ctx.fillRect(width*13/16, height*3/32, ctx.measureText("設定").width, 20 );
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "normal normal 15px MSゴシック";
            if( windowIndex == 0){
                ctx.fillText("戻る",width*13/16, height*3/32);
            }else{
                ctx.fillText("設定",width*13/16, height*3/32);
            }
            
            
        }
        
        
        function isPress(x1,y1,xwidth,yheight){
            
            var x2 = x1+xwidth;
            var y2 = y1+yheight;
            
            for(var [key,value] of touchInput){
                var x = value[0];
                var y = value[1];
                
                if( (x1<x && x<x2) && (y1<y && y<y2)){
                    return true;
                }
            }
            return false;
        }
            
        
    }


    
    
};



var WindowSize = function(){
    
    var width = 0;
    var height = 0;
    
    function resize(){
        width = document.documentElement.clientWidth;
        height = document.documentElement.clientHeight;
    
        document.getElementById(canvas_name).width = document.documentElement.clientWidth;
        document.getElementById(canvas_name).height = document.documentElement.clientHeight;
        console.info("resize is called");
    }
    
    resize();
    
    window.onresize = resize;
    
    
    
    WindowSize.prototype.getWidth = function(){
        return width;
    };
    
    WindowSize.prototype.getHeight = function(){
        return height;
    };
    
};


