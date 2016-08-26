
var audioContext = new AudioContext();
navigator.getUserMedia = navigator.getUserMedia ||　navigator.webkitGetUserMedia ||　navigator.mozGetUserMedia ||　navigator.msGetUserMedia;
//var audio = $DEMO[0].querySelector('.audio');
var link = $DEMO[0].querySelector('.link');
navigator.getUserMedia(
    {video: false, audio: true},
    function(stream){
        var bufferSize = 4096;
        var mediaStreamSource =　audioContext.createMediaStreamSource(stream);
        var scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);
        mediaStreamSource.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);
 
        var audioBufferArray = [];
        scriptProcessor.onaudioprocess = function(event){
            var channel = event.inputBuffer.getChannelData(0);
            var buffer = new Float32Array(bufferSize);
            for (var i = 0; i < bufferSize; i++) {
                buffer[i] = channel[i];
            }
            audioBufferArray.push(buffer);
        }
 
        setTimeout(function(){
            stream.stop();
            var src = audioContext.createBufferSource();
            src.buffer = getAudioBuffer(audioBufferArray, bufferSize);
            src.connect(audioContext.destination);
            src.start()
 
            var blob = exportWAV(audioBufferArray, audioContext.sampleRate)
            var url = URL.createObjectURL(blob);
            link.href = url;
            link.download = 'output.wav';
            link.textContent = 'download';
        }, 5000);
    },
    function(err){
        console.log(err.name ? err.name : err);
    }
);             
 
var getAudioBuffer = function(audioBufferArray, bufferSize){
    var o = this;
    var buffer = audioContext.createBuffer(
        1,
        audioBufferArray.length * bufferSize,
        audioContext.sampleRate
    );
    var channel = buffer.getChannelData(0);
    for (var i = 0; i < audioBufferArray.length; i++) {
        for (var j = 0; j < bufferSize; j++) {
            channel[i * bufferSize + j] = audioBufferArray[i][j];
        }
    }
    return buffer;
}        
var exportWAV = function(audioData, sampleRate) {
    var encodeWAV = function(samples, sampleRate) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        var view = new DataView(buffer);
        var writeString = function(view, offset, string) {
            for (var i = 0; i < string.length; i++){
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        var floatTo16BitPCM = function(output, offset, input) {
            for (var i = 0; i < input.length; i++, offset += 2){
                var s = Math.max(-1, Math.min(1, input[i]));
                output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        };
        writeString(view, 0, 'RIFF');  // RIFFヘッダ
        view.setUint32(4, 32 + samples.length * 2, true); // これ以降のファイルサイズ
        writeString(view, 8, 'WAVE'); // WAVEヘッダ
        writeString(view, 12, 'fmt '); // fmtチャンク
        view.setUint32(16, 16, true); // fmtチャンクのバイト数
        view.setUint16(20, 1, true); // フォーマットID
        view.setUint16(22, 1, true); // チャンネル数
        view.setUint32(24, sampleRate, true); // サンプリングレート
        view.setUint32(28, sampleRate * 2, true); // データ速度
        view.setUint16(32, 2, true); // ブロックサイズ
        view.setUint16(34, 16, true); // サンプルあたりのビット数
        writeString(view, 36, 'data'); // dataチャンク
        view.setUint32(40, samples.length * 2, true); // 波形データのバイト数
        floatTo16BitPCM(view, 44, samples); // 波形データ
        return view;
    };
    var mergeBuffers = function(audioData) {
        var sampleLength = 0;
        for (var i = 0; i < audioData.length; i++) {
          sampleLength += audioData[i].length;
        }
        var samples = new Float32Array(sampleLength);
        var sampleIdx = 0;
        for (var i = 0; i < audioData.length; i++) {
          for (var j = 0; j < audioData[i].length; j++) {
            samples[sampleIdx] = audioData[i][j];
            sampleIdx++;
          }
        }
        return samples;
    };
    var dataview = encodeWAV(mergeBuffers(audioData), sampleRate);
    var audioBlob = new Blob([dataview], { type: 'audio/wav' });
    return audioBlob;
};