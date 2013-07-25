## MediaStreamRecorder.js / [Demo](https://www.webrtc-experiment.com/MediaStreamRecorder/)

A cross-browser implementation to record audio/video streams.

=

#### Record audio using MediaStreamRecorder.js

```html
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder/MediaStreamRecorder.js"> </script>

<!-- For Firefox (Nightly) -->
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder/AudioStreamRecorder/MediaRecorder.js"> </script>

<!-- For Chrome -->
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder/AudioStreamRecorder/StereoRecorder.js"> </script>
```

```javascript
var mediaConstraints = {
    audio: true
};

navigator.mozGetUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

function onMediaSuccess(stream) {
    var mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'audio/ogg';
	
    // For Chrome; web-worker file
    mediaRecorder.workerPath = 'https://www.webrtc-experiment.com/AudioStreamRecorder/Workers/StereoAudioRecorder-Worker.js';
	
    mediaRecorder.ondataavailable = function (blob) {
        // POST/PUT "Blob" using FormData/XHR2

        // or read as DataURL
        var reader = new FileReader();
        reader.onload = function (e) {
            var dataURL = e.target.result;
            window.open(dataURL);
        };
        reader.readAsDataURL(blob);
    };
    mediaRecorder.start(3000);
}

function onMediaError(e) {
    console.error('media error', e);
}
```

=

#### Record video using MediaStreamRecorder.js

```html
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder/MediaStreamRecorder.js"> </script>

<!-- Using Whammy to record WebM files -->
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder/VideoStreamRecorder/WhammyRecorder.js"> </script>
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder/VideoStreamRecorder/lib/whammy.js"> </script>
```

```javascript
var mediaConstraints = {
    video: true
};

navigator.mozGetUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

function onMediaSuccess(stream) {
    var mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'video/webm';
	
    mediaRecorder.videoWidth = 320;
    mediaRecorder.videoHeight = 240;
	
    mediaRecorder.ondataavailable = function (blob) {
        // POST/PUT "Blob" using FormData/XHR2

        // or read as DataURL
        var reader = new FileReader();
        reader.onload = function (e) {
            var dataURL = e.target.result;
            window.open(dataURL);
        };
        reader.readAsDataURL(blob);
    };
    mediaRecorder.start(3000);
}

function onMediaError(e) {
    console.error('media error', e);
}
```


=

#### Record gif using MediaStreamRecorder.js

```html
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder/MediaStreamRecorder.js"> </script>

<!-- Using jsGIF to record GIF files -->
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder/VideoStreamRecorder/GifRecorder.js"> </script>
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder/VideoStreamRecorder/lib/gif-encoder.js"> </script>
```

```javascript
var mediaConstraints = {
    video: true
};

navigator.mozGetUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

function onMediaSuccess(stream) {
    var mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'image/gif';
	
    mediaRecorder.videoWidth = 320;
    mediaRecorder.videoHeight = 240;
	
    // mediaRecorder.frameRate = 300;
    // mediaRecorder.quality = 1;
	
    mediaRecorder.ondataavailable = function (blob) {
        // POST/PUT "Blob" using FormData/XHR2

        // or read as DataURL
        var reader = new FileReader();
        reader.onload = function (e) {
            var dataURL = e.target.result;
            window.open(dataURL);
        };
        reader.readAsDataURL(blob);
    };
    mediaRecorder.start(3000);
}

function onMediaError(e) {
    console.error('media error', e);
}
```

=

#### Demos

1. [Audio Recording using MediaStreamRecorder](https://www.webrtc-experiment.com/MediaStreamRecorder/demos/audio-recorder.html)
2. [Video/Gif Recording using MediaStreamRecorder](https://www.webrtc-experiment.com/MediaStreamRecorder/demos/video-recorder.html)

=

##### License

[MediaStreamRecorder.js](https://github.com/streamproc/MediaStreamRecorder) library is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://github.com/muaz-khan) and [neizerth](https://github.com/neizerth).
