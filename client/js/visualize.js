function Visualize(context,beforenode){ 
    // Create the instance of AnalyserNode
    var analyser = context.createAnalyser();
    analyser.fftSize = 2048;  // The default value
    // for the instance of OscillatorNode
    
    var ctx;
    
    var canvas = document.getElementById("wave");
        if (canvas.getContext){
            ctx = canvas.getContext('2d');
            // 表示間隔とフレームごとに実行する関数を指定
            setInterval(draw, 33);
    }
    var intervalid = null;
    // Flag for starting or stopping sound

        beforenode.connect(analyser);
        analyser.connect(context.destination);
        function draw() {
            var range = analyser.maxDecibels - analyser.minDecibels;  // 70 dB
            // Get data for drawing spectrum (dB)
            var spectrums = new Float32Array(analyser.frequencyBinCount);  // Array size is 1024 (half of FFT size)
            analyser.getFloatFrequencyData(spectrums);
            // Clear previous data
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw spectrum (dB)
            ctx.beginPath();
            for (var i = 0, len = spectrums.length; i < len; i++) {
                var x = (i / len) * canvas.width;
                var y = (-1 * ((spectrums[i] - analyser.maxDecibels) / range)) * canvas.height;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        };
};