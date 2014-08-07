// Muaz Khan     - https://github.com/muaz-khan 
// neizerth      - https://github.com/neizerth
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/streamproc/MediaStreamRecorder
// ==========================================================
// WhammyRecorder.js

function WhammyRecorder(mediaStream) {
    this.start = function(timeSlice) {
        timeSlice = timeSlice || 1000;
        
        if (!this.width) this.width = video.offsetWidth || 320;
        if (!this.height) this.height = video.offsetHeight || 240;

        if (!this.video) {
            this.video = {
                width: this.width,
                height: this.height
            };
        }

        if (!this.canvas) {
            this.canvas = {
                width: this.width,
                height: this.height
            };
        }

        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;

        video.width = this.video.width;
        video.height = this.video.height;

        drawFrames();
        
        (function getWebMBlob() {
            !isStopDrawing && setTimeout(function() {
                whammy.frames = dropFirstFrame(frames);
                frames = [];
                var WebM_Blob = whammy.compile();
                self.ondataavailable(WebM_Blob);
                getWebMBlob();
            }, timeSlice);
        })();
    };

    var frames = [];

    function drawFrames() {
        if(isStopDrawing) return;
        
        var duration = new Date().getTime() - lastTime;
        if (!duration) return drawFrames();

        // via webrtc-experiment#206, by Jack i.e. @Seymourr
        lastTime = new Date().getTime();

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        !isStopDrawing && frames.push({
            duration: duration,
            image: canvas.toDataURL('image/webp')
        });

        setTimeout(drawFrames, 10);
    }

    var isStopDrawing = false;

    this.stop = function() {
        isStopDrawing = true;
        whammy.frames = dropFirstFrame(frames);
        frames = [];
        var WebM_Blob = whammy.compile();
        this.ondataavailable(WebM_Blob);
    };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var video = document.createElement('video');
    video.muted = true;
    video.volume = 0;
    video.autoplay = true;
    video.src = URL.createObjectURL(mediaStream);
    video.play();

    var lastTime = new Date().getTime();

    var whammy = new Whammy.Video();
    var self = this;
}
