// Muaz Khan     - https://github.com/muaz-khan 
// neizerth      - https://github.com/neizerth
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/streamproc/MediaStreamRecorder
// ==========================================================
// StereoRecorder.js

function StereoRecorder(mediaStream) {
    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        timeSlice = timeSlice || 1000;

        mediaRecorder = new StereoAudioRecorder(mediaStream, this);

        (function looper() {
            mediaRecorder.record();

            setTimeout(function() {
                mediaRecorder.stop();
                mediaRecorder.getBlob();
                looper();
            }, timeSlice);
        })();
    };

    this.stop = function() {
        if (mediaRecorder) mediaRecorder.stop();
    };

    this.ondataavailable = function(blob) { };

    // Reference to "StereoAudioRecorder" object
    var mediaRecorder;
}

function StereoAudioRecorder(mediaStream, root) {
    root = root || { };

    var audioContext = new AudioContext;
    var mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
    mediaStreamSource.connect(audioContext.destination);

    var bufferSize = root.bufferSize || 4096;
    var numberOfInputChannels = 2;
    var numberOfOutputChannels = 2;

    var node = audioContext.createJavaScriptNode(bufferSize, numberOfInputChannels, numberOfOutputChannels);

    var worker = new Worker(root.workerPath || 'StereoAudioRecorder-Worker.js');
    worker.postMessage({
        command: 'init',
        config: {
            sampleRate: audioContext.sampleRate
        }
    });

    var recording = false;

    node.onaudioprocess = function(e) {
        if (!recording) return;

        var buffer = [
            e.inputBuffer.getChannelData(0),
            e.inputBuffer.getChannelData(1)
        ];

        if (buffer[0] && buffer[0][1] == 0) {
            console.log('Unable to capture audio.');
        }

        worker.postMessage({
            command: 'record',
            buffer: buffer
        });
    };

    mediaStreamSource.connect(node);
    node.connect(audioContext.destination);

    this.getBuffer = function() {
        worker.postMessage({
            command: 'getBuffer'
        });
    };

    this.getBlob = function() {
        worker.postMessage({
            command: 'getBlob',
            type: root.type || 'audio/wav'
        });
    };

    worker.onmessage = function(e) {
        root.ondataavailable(e.data);
    };

    this.record = function() {
        recording = true;
    };

    this.pause = function() {
        recording = false;
    };

    this.stop = function() {
        recording = false;
    };
}
