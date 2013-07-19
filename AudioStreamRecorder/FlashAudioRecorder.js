// muazkh - github.com/muaz-khan 
// @neizerth - github.com/neizerth
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/streamproc/MediaStreamRecorder
// ==========================================================
// FlashAudioRecorder.js
// Based on recorder.js - https://github.com/jwagener/recorder.js
function FlashAudioRecorder(o)
{
	if (o  == null) {
		o = {};
	}
	var recorder = this,
		baseUrl = getBaseUrl(),
		defaults = {
			swfObjectPath: baseUrl+'lib/recorder.js/recorder.swf',
			jsLibPath: baseUrl+'lib/recorder.js/recorder.js',
			encoderPath: baseUrl+'lib/wavencoder/wavencoder.js',
			flashContainer: null,
			ondataavailable: null,
			onstop: function(e) {

			},
			onstart:function(e) {

			},
			onFlashSecurity: function(e) {

    		},
    		onready: function(e) {

    		}
		},
		initialized = false,
		options = extend(defaults,o);

	include(options.jsLibPath,init);
	include(options.encoderPath,initEncoder);
	
	function init() {
		Recorder.initialize({
			swfSrc: options.swfObjectPath,
			flashContainer: options.flashContainer,
			onFlashSecurity: function(e) {
				recorder.onFlashSecurity(e);
	    	},
	    	initialized: function(e) {
	    		recorder.onready();
	    	}
		});
	}
	function initEncoder() {
		WavEncoder.defaults = {
		    numChannels: 1,      // mono
		    sampleRateHz: 44100, // 44100 Hz
		    bytesPerSample: 2,   // 16 bit
		    clip: true
		};
	}
	function start(interval) {
		Recorder.record({
			start: function(e) {
    			recorder.onstart(e);
    		}
  		});
	}
	function stop() {
		Recorder.stop();
		recorder.onstop();
		if (typeof recorder.ondataavailable == 'function') {
			var data = Recorder.audioData(),
				datauri = WavEncoder.encode(data),
				audioBlob = new Blob([datauri], {
			        type: 'audio/wav'
			    });

			recorder.ondataavailable({
				data: audioBlob
			});
			
			Recorder.options.flashContainer.parentNode.removeChild(Recorder.options.flashContainer);

			delete datauri;
			delete data;
			delete audioBlob;
			recorder.ondataavailable = null;
		}
	}
	function upload(options) {
		Recorder.upload(options);
	}
	// get script folder
	function getBaseUrl() {
		var scripts = document.head.getElementsByTagName("script");
		var loc = scripts[scripts.length-1].src;
		return loc.substring(0, loc.lastIndexOf('/'))+'/';
	}
	//  extending user options
	function extend(o1,o2) {
		var obj = {};
		for(var i in o1)
		{
			if (o2[i] != null) {
				if (typeof o2[i] == "object") {
					obj[i] = extend(o2[i],{});
				}
				else {
					obj[i] = o2[i];
				}
			}
			else {
				if (typeof o2[i] == "object") {
					obj[i] = extend(o1[i],{});
				}
				else {
					obj[i] = o1[i];
				}
			}
		}
		return obj;
	}
	function include(src,callback) {
		var scripts = document.getElementsByTagName('script'),
			found = false;

		for (var i = 0,len = scripts.length;i < len; i++)
		{
			if (scripts[i].getAttribute('src') == src) {
				found = true;
			}
		}
		if (found) {
			if (typeof callback == 'function') {
				callback();
			}
		}
		else
		{
			var js = document.createElement("script");

			js.type = "text/javascript";
			js.src = src;
			if (typeof callback == 'function') {
				js.onload = callback;
			}

			document.body.appendChild(js);
		}
		
	}

	this.ondataavailable = options.ondataavailable;
	this.onstop = options.onstop;
	this.onstart = options.onstart;
	this.onFlashSecurity = options.onFlashSecurity;
	this.onready = options.onready;

	this.start = start;
	this.upload = upload;
	this.stop = stop;
	this.baseUrl = baseUrl;
}