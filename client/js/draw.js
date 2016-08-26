var Draw = function(canvas_name,swindowsize){
    
    var ctx;
    
    var canvas = document.getElementById(canvas_name);
        if (canvas.getContext){
            ctx = canvas.getContext('2d');
            // 表示間隔とフレームごとに実行する関数を指定
            setInterval(draw, 33);
        }
    var windowsize = swindowsize;
    
    
    
    function draw(){
        
        var width = windowsize.getWidth();
        var height = windowsize.getHeight();
        
        // background
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = "lighter";
        
        
        
        // text
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = "center";
        ctx.font = "normal normal 30px sans-serif";
        ctx.fillText("Access this URL",width/2,height/2-40);
        ctx.fillText("Sound play!",width/2,height/2);
        
        //ctx.fill();
    };
    
};

