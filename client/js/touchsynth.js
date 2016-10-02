var width_div = 12;
var height_div = 4;
var baseKey = 60;
var canvas_name;

var TouchSynth = function(canvasname,io){
    
    var socket = io;
    
    var context;
    var master;
    var oscillator;
    var canvas;
    var windowsize;
    
    var isRecording = false;
    
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
    
    function sendNoteOn(id,key){
        socket.emit('noteOn',[id,key]);
    }
        
    /*
    function sendNoteChange(id,key){
        socket.emit('noteChange',[id,key]);
    }
    */
        
    function sendNoteOff(id,key){
        socket.emit('noteOff',[id,key]);
    }
    
    function sendRecordingOn(){
        console.log("sendRecordingOn is called");
        socket.emit('recordingOn',0);
    }
    
    function sendRecordingOff(){
        console.log("sendRecordingOff is called");
        socket.emit('recordingOff',0);
    }
    
    
    
    function TouchInput()
    {
        console.info("touchInput id called");
        var touchMap = new Map();
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
				
				var ykey = parseInt(y/(windowsize.getHeight()/height_div));
				var xkey = parseInt(x/(windowsize.getWidth()/width_div));
				
				var key = baseKey + ykey*width_div + xkey;
				//var vol = x/windowsize.getWidth() * 1.0;
				
				sendNoteOn(id,key);
				touchMap.set(id,key);
				touchXY.set(id,[x,y]);
				
				if(ykey == height_div-1 && xkey == width_div-1){
				    console.log("recording button is pushed");
				    if(isRecording){
				        sendRecordingOff();
				        isRecording = false;
				    }else{
				        sendRecordingOn();
				        isRecording = true;
				    }
				}
				
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
				
				var ykey = parseInt(y/(windowsize.getHeight()/height_div));
				var xkey = parseInt(x/(windowsize.getWidth()/width_div));
				
				var key = baseKey + ykey*width_div + xkey;
				//var vol = x/windowsize.getWidth() * 1.0;
				
				/*
				var oscs = touchMap.get(id);
				oscs[0].frequency.value = MtoF(key);
				oscs[1].gain.value = vol;
				*/
				if(touchMap[id] != key){
				    sendNoteOff(id,touchMap[id]);
				    sendNoteOn(id,key);
				    touchMap[id] = key;
				}
				touchXY.set(id,[x,y]);
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
				
				/*
				var oscs = touchMap.get(id);
				oscs[0].stop();
				touchMap.delete(id);
				*/
				var ykey = parseInt(y/(windowsize.getHeight()/height_div));
				var xkey = parseInt(x/(windowsize.getWidth()/width_div));
				
				var key = baseKey + ykey*width_div + xkey;
				
				sendNoteOff(id,key);
				touchMap.delete(id);
				touchXY.delete(id);
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
	        
	        var ykey = parseInt(y/(windowsize.getHeight()/height_div));
			var xkey = parseInt(x/(windowsize.getWidth()/width_div));
				
			var key = baseKey + ykey*width_div + xkey;
			//var vol = x/windowsize.getWidth() * 1.0;
			
			//oscillator.noteOn(id,key,vol);
	        
	        mousepress = true;
	        
	        
	        prekey = key;
	        sendNoteOn(id,key);
	        touchXY.set(id,[x,y]);
	        
	        
	        if(ykey == height_div-1 && xkey == width_div-1){
	            console.log("recording button is pushed");
				    if(isRecording){
				        sendRecordingOff();
				        isRecording = false;
				    }else{
				        sendRecordingOn();
				        isRecording = true;
				    }
			}
			
        };
        
        function MousemoveEventFunc(e){
            if(mousepress){
                var x = e.clientX;
    	        var y = e.clientY;
    	        
    	        var ykey = parseInt(y/(windowsize.getHeight()/height_div));
				var xkey = parseInt(x/(windowsize.getWidth()/width_div));
				
				var key = baseKey + ykey*width_div + xkey;
    			//var vol = x/windowsize.getWidth() * 1.0;
    			
    			if(prekey != key){
				    sendNoteOff(id,prekey);
				    sendNoteOn(id,key);
				    prekey = key;
				}
				touchXY.set(id,[x,y]);
            }
        };
        function MouseupEventFunc(e){
            if(mousepress){
                var x = e.clientX;
    	        var y = e.clientY;
    	        
    	        var ykey = parseInt(y/(windowsize.getHeight()/height_div));
				var xkey = parseInt(x/(windowsize.getWidth()/width_div));
				
				var key = baseKey + ykey*width_div + xkey;
    			//var vol = x/windowsize.getWidth() * 1.0;
    	        
    	        //oscillator.noteOff(id);
	            mousepress = false;
	            
	            console.log("id:"+id+" key:"+key);
	            
	            sendNoteOff(id,key);
	            touchXY.delete(id);
            }
        };
        
        document.addEventListener("mousedown",MousedownEventFunc);
		document.addEventListener("mousemove",MousemoveEventFunc);
		document.addEventListener("mouseup",MouseupEventFunc);
		document.addEventListener("mouseout",MouseupEventFunc);
    };
    
    var KeyboardInput = function()
    {
        
        // キーボードの入力状態を記録する配列
        var input_key_buffer = new Array();
        
        // ------------------------------------------------------------
        // キーボードを押したときに実行されるイベント
        // ------------------------------------------------------------
        document.onkeydown = function (e){
        	if(!e) e = window.event; // レガシー
        
        	input_key_buffer[e.keyCode] = true;
        };
        
        // ------------------------------------------------------------
        // キーボードを離したときに実行されるイベント
        // ------------------------------------------------------------
        document.onkeyup = function (e){
        	if(!e) e = window.event; // レガシー
        
        	input_key_buffer[e.keyCode] = false;
        };
        
        // ------------------------------------------------------------
        // ウィンドウが非アクティブになる瞬間に実行されるイベント
        // ------------------------------------------------------------
        window.onblur = function (){
        	// 配列をクリアする
        	input_key_buffer.length = 0;
        };
        
        // ------------------------------------------------------------
        // キーボードが押されているか調べる関数
        // ------------------------------------------------------------
        this.KeyIsDown = function(key_code){
        
        	if(input_key_buffer[key_code])	return true;
        
        	return false;
        };
        
        /*
        キー	keyCode
        0	48
        1	49
        2	50
        3	51
        4	52
        5	53
        6	54
        7	55
        8	56
        9	57
        A	65
        B	66
        C	67
        D	68
        E	69
        F	70
        G	71
        H	72
        I	73
        J	74
        K	75
        L	76
        M	77
        N	78
        O	79
        P	80
        Q	81
        R	82
        S	83
        T	84
        U	85
        V	86
        W	87
        X	88
        Y	89
        Z	90
        
        F1	112
        F2	113
        F3	114
        F4	115
        F5	116
        F6	117
        F7	118
        F8	119
        F9	120
        F10	121
        F11	122
        F12	123
        F13	124
        F14	125
        F15	126
        
        BackSpace	8
        Tab	9
        Clear	12
        Enter	13
        Command	15
        Shift	16
        Ctrl	17
        Alt	18
        CapsLock	20
        Esc	27
        スペースバー	32
        PageUp	33
        PageDown	34
        End	35
        Home	36
        ← (左矢印)	37
        ↑ (上矢印)	38
        → (右矢印)	39
        ↓ (下矢印)	40
        Insert	45
        Delete	46
        NumLock	144
        , <	188
        . >	190
        / ?	191
        [ {	219
        \ |	220
        ] }	221
        */
    };
    
    
    
    function Draw(canvas_name,swindowsize){
    
        var ctx;
        
        var canvas = document.getElementById(canvas_name);
            if (canvas.getContext){
                ctx = canvas.getContext('2d');
                // 表示間隔とフレームごとに実行する関数を指定
                setInterval(draw, 33);
            }
        var windowsize = swindowsize;
        
        var press;
        
        function draw(){
            
            var width = windowsize.getWidth();
            var height = windowsize.getHeight();
            
            update(width,height);
            
            
            
            // background
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = "lighter";
            
            var rectx = width/width_div;
            var recty = height/height_div;
            
            //ctx.fillStyle = "#FFFFFF";
            for(var x=0; x<width_div; x++){
                for(var y=0; y<height_div; y++){
                    if(press[x][y]){
                        ctx.fillStyle = "#FFFFFF";
                        ctx.fillRect(x*rectx, y*recty, rectx, recty);
                    }else{
                        ctx.strokeStyle = "rgb(255, 255, 255)";;
                        ctx.strokeRect(x*rectx, y*recty, rectx, recty);
                    }
                    
                    if(x == width_div-1 && y == height_div-1){
                        if(isRecording)ctx.fillStyle = "#FF0000";
                        else ctx.fillStyle = "#660000";
                        ctx.fillRect(x*rectx, y*recty, rectx, recty);
                    }
                    
                    
                }
            }
            
            
            
            
            // text
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = "center";
            ctx.font = "normal normal 30px sans-serif";
            ctx.fillText("Touch or Mouse Click",width/2,height/2);
            
            //ctx.fill();
        };
        
        function update(width,height){
            
            press = new Array(width_div);
            for(var i=0; i<press.length; i++){
                press[i] = new Array();
                for(var j=0; j<height_div; j++){
                    press[i].push(false);
                }
            }
            
            for(var [key,value] of touchXY){
                var x = value[0];
                var y = value[1];
                var xnum = parseInt(x/(width/width_div));
                var ynum = parseInt(y/(height/height_div));
                try{
                    press[xnum][ynum] = true;
                    
                }catch(e){
                    console.log(e);
                }
                
                
                
            }
            
            
            
            
        }
        
        
    };


    
    
};


/*
var Scroll_Event = function(){
        
    //スクロール禁止用関数
    var scroll_event = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
    $(document).on(scroll_event,function(e){e.preventDefault();});
    document.body.style.overflow = "hidden";
    
    $(window).on('touchmove.noScroll', function(e) {
        e.preventDefault();
    });
    
	$(function(){
		$('a').click(function(){
			location.href = $(this).attr('href');
			return false;
		});
	});
	
};
*/


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
