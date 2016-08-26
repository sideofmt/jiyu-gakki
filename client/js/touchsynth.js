var TouchSynth = function(canvasname,io){
    
    var socket = io;
    
    var context;
    var master;
    var oscillator;
    var canvas;
    var windowsize;
    
    var canvas_name = canvasname;
    
    //window.onload = function init()
    Scroll_Event();
    windowsize = new WindowSize(canvas_name);
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
        
    function sendNoteChange(id,key){
        socket.emit('noteChange',[id,key]);
    }
        
    function sendNoteOff(id,key){
        socket.emit('noteOff',[id,key]);
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
				
				var key = Math.floor(y/windowsize.getHeight() * 24 + 60);
				var vol = x/windowsize.getWidth() * 1.0;
				
				sendNoteOn(id,key);
				
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
				
				var key = Math.floor(y/windowsize.getHeight() * 24 + 60);
				var vol = x/windowsize.getWidth() * 1.0;
				
				/*
				var oscs = touchMap.get(id);
				oscs[0].frequency.value = MtoF(key);
				oscs[1].gain.value = vol;
				*/
				
				sendNoteChange(id,key);
				
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
				var key = Math.floor(y/windowsize.getHeight() * 24 + 60);
				
				sendNoteOff(id,key);
				
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
        
        function MousedownEventFunc(e){
            var x = e.clientX;
	        var y = e.clientY;
	        
	        var key = Math.floor(y/windowsize.getHeight() * 24 + 60);
			var vol = x/windowsize.getWidth() * 1.0;
			
			//oscillator.noteOn(id,key,vol);
	        
	        mousepress = true;
	        
	        
	        
	        sendNoteOn(id,key);
	        
        };
        
        function MousemoveEventFunc(e){
            if(mousepress){
                var x = e.clientX;
    	        var y = e.clientY;
    	        
    	        var key = Math.floor(y/windowsize.getHeight() * 24 + 60);
    			var vol = x/windowsize.getWidth() * 1.0;
    			
    			sendNoteChange(id,key);
            }
        };
        function MouseupEventFunc(e){
            if(mousepress){
                var x = e.clientX;
    	        var y = e.clientY;
    	        
    	        var key = Math.floor(y/windowsize.getHeight() * 24 + 60);
    			var vol = x/windowsize.getWidth() * 1.0;
    	        
    	        //oscillator.noteOff(id);
	            mousepress = false;
	            
	            console.log("id:"+id+" key:"+key);
	            
	            sendNoteOff(id,key);
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
    
};