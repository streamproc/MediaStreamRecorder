// @muazkh - github.com/muaz-khan 
// neizerth - github.com/neizerth
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/streamproc/MediaStreamRecorder
// ==========================================================
// MediaStreamRecorder.js

function MediaStreamRecorder(mediaStream) {
    if (!mediaStream) throw 'MediaStream is mandatory.';

    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorder.ondataavailable = this.ondataavailable;
        mediaRecorder.onstop = this.onstop;
        mediaRecorder.start(timeSlice);
    };

    this.stop = function() {
        if (mediaRecorder) mediaRecorder.stop();
    };

    this.ondataavailable = function(blob) {
        console.log('ondataavailable..', blob);
    };

    this.onstop = function() {
        console.log('stopped..');
    };

    // Reference to "MediaRecorder.js"
    var mediaRecorder;
}
