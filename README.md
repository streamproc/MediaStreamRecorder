## MediaStreamRecorder.js / [Demo](https://www.webrtc-experiment.com/MediaStreamRecorder/)

A cross-browser implementation to record audio/video streams.

=

#### First Step: Link the libraries

```html
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder/common.js"> </script>
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder/MediaStreamRecorder.js"> </script>
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder/AudioStreamRecorder/MediaRecorder.js"> </script>
```

=

#### Last Step: Start using it!

```javascript
var mediaConstraints = {
    audio: true
};

navigator.mozGetUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

function onMediaSuccess(stream) {
    var mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'audio/ogg';
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

=

##### License

[MediaStreamRecorder.js](https://github.com/streamproc/MediaStreamRecorder) library is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://github.com/muaz-khan) and [neizerth](https://github.com/neizerth).
