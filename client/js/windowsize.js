var WindowSize = function(canvas_name){
    
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

