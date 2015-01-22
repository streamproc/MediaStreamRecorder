// ======================
// StereoAudioRecorder.js
// source code from: http://typedarray.org/wp-content/projects/WebAudioRecorder/script.js

var __stereoAudioRecorderJavacriptNode;

function StereoAudioRecorder(mediaStream, config) {
    if (!mediaStream.getAudioTracks().length) {
        throw 'Your stream has no audio tracks.';
    }

    // variables
    var leftchannel = [];
    var rightchannel = [];
    var recording = false;
    var recordingLength = 0;

    this.record = function() {
        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = 0;
        recordingLength = 0;

        recording = true;
    };

    function mergeLeftRightBuffers(config, callback) {
        var webWorker = processInWebWorker(function mergeAudioBuffers(config) {
            var leftBuffers = config.leftBuffers;
            var rightBuffers = config.rightBuffers;
            var sampleRate = config.sampleRate;

            leftBuffers = mergeBuffers(leftBuffers[0], leftBuffers[1]);
            rightBuffers = mergeBuffers(rightBuffers[0], rightBuffers[1]);

            function mergeBuffers(channelBuffer, rLength) {
                var result = new Float64Array(rLength);
                var offset = 0;
                var lng = channelBuffer.length;

                for (var i = 0; i < lng; i++) {
                    var buffer = channelBuffer[i];
                    result.set(buffer, offset);
                    offset += buffer.length;
                }

                return result;
            }

            function interleave(leftChannel, rightChannel) {
                var length = leftChannel.length + rightChannel.length;

                var result = new Float64Array(length);

                var inputIndex = 0;

                for (var index = 0; index < length;) {
                    result[index++] = leftChannel[inputIndex];
                    result[index++] = rightChannel[inputIndex];
                    inputIndex++;
                }
                return result;
            }

            function writeUTFBytes(view, offset, string) {
                var lng = string.length;
                for (var i = 0; i < lng; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            }

            // interleave both channels together
            var interleaved = interleave(leftBuffers, rightBuffers);

            var interleavedLength = interleaved.length;

            // create wav file
            var resultingBufferLength = 44 + interleavedLength * 2;

            var buffer = new ArrayBuffer(resultingBufferLength);

            var view = new DataView(buffer);

            // RIFF chunk descriptor/identifier 
            writeUTFBytes(view, 0, 'RIFF');

            // RIFF chunk length
            var blockAlign = 4;
            view.setUint32(blockAlign, 44 + interleavedLength * 2, true);

            // RIFF type 
            writeUTFBytes(view, 8, 'WAVE');

            // format chunk identifier 
            // FMT sub-chunk
            writeUTFBytes(view, 12, 'fmt ');

            // format chunk length 
            view.setUint32(16, 16, true);

            // sample format (raw)
            view.setUint16(20, 1, true);

            // stereo (2 channels)
            view.setUint16(22, 2, true);

            // sample rate 
            view.setUint32(24, sampleRate, true);

            // byte rate (sample rate * block align)
            view.setUint32(28, sampleRate * blockAlign, true);

            // block align (channel count * bytes per sample) 
            view.setUint16(32, blockAlign, true);

            // bits per sample 
            view.setUint16(34, 16, true);

            // data sub-chunk
            // data chunk identifier 
            writeUTFBytes(view, 36, 'data');

            // data chunk length 
            view.setUint32(40, interleavedLength * 2, true);

            // write the PCM samples
            var offset = 44,
                leftChannel;
            for (var i = 0; i < interleavedLength; i++, offset += 2) {
                var size = Math.max(-1, Math.min(1, interleaved[i]));
                var currentChannel = size < 0 ? size * 32768 : size * 32767;

                if (config.leftChannel) {
                    if (currentChannel !== leftChannel) {
                        view.setInt16(offset, currentChannel, true);
                    }
                    leftChannel = currentChannel;
                } else {
                    view.setInt16(offset, currentChannel, true);
                }
            }

            postMessage({
                buffer: buffer,
                view: view
            });
        });

        webWorker.onmessage = function(event) {
            callback(event.data.buffer, event.data.view);
        };

        webWorker.postMessage(config);
    }

    function processInWebWorker(_function) {
        var blob = URL.createObjectURL(new Blob([_function.toString(),
            'this.onmessage =  function (e) {mergeAudioBuffers(e.data);}'
        ], {
            type: 'application/javascript'
        }));

        var worker = new Worker(blob);
        URL.revokeObjectURL(blob);
        return worker;
    }

    this.requestData = function() {
        if (recordingLength == 0) {
            requestDataInvoked = false;
            return;
        }

        requestDataInvoked = true;
        // to make sure onaudioprocess stops firing
        audioInput.disconnect();

        mergeLeftRightBuffers({
            sampleRate: sampleRate,
            leftChannel: config.leftChannel,
            leftBuffers: [leftchannel, recordingLength],
            rightBuffers: [rightchannel, recordingLength]
        }, function(buffer, view) {
            var blob = new Blob([view], {
                type: 'audio/wav'
            });

            config.ondataavailable(blob);

            isAudioProcessStarted = false;
            requestDataInvoked = false;
        });
    };

    this.stop = function() {
        // we stop recording
        recording = false;
        this.requestData();
    };

    if (!ObjectStore.AudioContextConstructor) {
        ObjectStore.AudioContextConstructor = new ObjectStore.AudioContext();
    }

    var context = ObjectStore.AudioContextConstructor;

    // creates an audio node from the microphone incoming stream
    var audioInput = context.createMediaStreamSource(mediaStream);

    var legalBufferValues = [0, 256, 512, 1024, 2048, 4096, 8192, 16384];

    // "0" means, let chrome decide the most accurate buffer-size for current platform.
    var bufferSize = typeof config.bufferSize === 'undefined' ? 4096 : config.bufferSize;

    if (legalBufferValues.indexOf(bufferSize) === -1) {
        if (!config.disableLogs) {
            console.warn('Legal values for buffer-size are ' + JSON.stringify(legalBufferValues, null, '\t'));
        }
    }

    var sampleRate = typeof config.sampleRate !== 'undefined' ? config.sampleRate : context.sampleRate || 44100;

    if (sampleRate < 22050 || sampleRate > 96000) {
        // Ref: http://stackoverflow.com/a/26303918/552182
        if (!config.disableLogs) {
            console.warn('sample-rate must be under range 22050 and 96000.');
        }
    }

    if (context.createJavaScriptNode) {
        __stereoAudioRecorderJavacriptNode = context.createJavaScriptNode(bufferSize, 2, 2);
    } else if (context.createScriptProcessor) {
        __stereoAudioRecorderJavacriptNode = context.createScriptProcessor(bufferSize, 2, 2);
    } else {
        throw 'WebAudio API has no support on this browser.';
    }

    // connect the stream to the gain node
    audioInput.connect(__stereoAudioRecorderJavacriptNode);

    bufferSize = __stereoAudioRecorderJavacriptNode.bufferSize;

    if (!config.disableLogs) {
        console.log('sample-rate', sampleRate);
        console.log('buffer-size', bufferSize);
    }

    var isAudioProcessStarted = false;

    __stereoAudioRecorderJavacriptNode.onaudioprocess = function(e) {
        // if MediaStream().stop() or MediaStreamTrack.stop() is invoked.
        if (mediaStream.ended) {
            __stereoAudioRecorderJavacriptNode.onaudioprocess = function() {};
            return;
        }

        if (!recording) {
            audioInput.disconnect();
            return;
        }

        if (!isAudioProcessStarted) {
            isAudioProcessStarted = true;
            if (config.onAudioProcessStarted) {
                config.onAudioProcessStarted();
            }
        }

        var left = e.inputBuffer.getChannelData(0);
        var right = e.inputBuffer.getChannelData(1);

        // we clone the samples
        leftchannel.push(new Float32Array(left));
        rightchannel.push(new Float32Array(right));

        recordingLength += bufferSize;
    };

    // to prevent self audio to be connected with speakers
    __stereoAudioRecorderJavacriptNode.connect(context.destination);
}
