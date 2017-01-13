var percs = new Map();

class Drum{

    constructor(context){
        
        var perc_name = ["clap","closedHH","crash","crash2","floorTom","kick","kick2","lowTom","middleTom","openHH","ride","snare"];
        var perc_index = [39,42,49,57,43,35,36,45,47,46,51,40];
        
        //this.percs = new Map();
        
        for(var i=0; i<perc_name.length; i++){

            // Audio dataの読み込み
            var filePath = "./sound/drums/"+perc_name[i]+".wav";
            LoadAudioData(context, filePath, this.loadSetup(perc_index[i]) );
            
        }
        console.log("load end drums sound files");
        
    }
        
    loadSetup(index){
        
        return loadAudioDataCallback;
        
        function loadAudioDataCallback(context, audioBuf){
            
            percs.set(index,audioBuf);
        }
    }
    
    play(key){
        // Audio data Bufferの生成
        var src = context.createBufferSource();
        var gainNode = context.createGain();
        gainNode.gain.value = 0.3;
        
        
        try{
            var buf = percs.get(key);
            var duration = buf.duration;
            
            // Audio dataの再生
            src.buffer = buf;
            src.connect(gainNode);
            gainNode.connect(context.destination);
            src.start(0,0,duration); // duration = 再生する時間
            
            return gainNode;
            
        }catch(e){
            console.error(e);
        }
    }
    
}






/*

context : AudioContextを指定します
filePath : ファイルパスを指定します
callback : データ読み込み完了時に実行するcallback関数を指定します

*/
var LoadAudioData = function( context, filePath, callback)
{
    var xhr = new XMLHttpRequest();
    
    xhr.open("GET",filePath);
    xhr.responseType = "arraybuffer";
    
    xhr.onload = function(){
        
        var arrayBuffer = xhr.response;
        
        context.decodeAudioData( arrayBuffer, successCallback, errorCallback );
        function successCallback( audioBuf ){
            //console.log("[input file]"+filePath);
            //console.log("[duration]"+audioBuf.duration+"s");
            //console.log("[sample Rate]"+audioBuf.sampleRate + "Hz");
            
            var audioData = audioBuf.getChannelData(0);
            var ymax = 0;
            for(var i=0; i<audioData.length; i++){
                var y = Math.abs( audioData[i] );
                if(y > ymax) ymax = y;
            }
            for(var i=0; i< audioData.length; i++){
                audioData[i] /= ymax;
            }
            
            // callback関数の実行
            callback( context, audioBuf );
        }
        
        function errorCallback(error){
            console.log("[Error] オーディオファイルのデコードに失敗しました (context.decodeAudioData())");
            console.log(error);
        };
    };
    xhr.send();
};