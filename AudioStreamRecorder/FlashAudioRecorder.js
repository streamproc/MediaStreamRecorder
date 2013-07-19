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
			dataType:'url', // url | blob | raw | dataUri | null
			uploadParams:{

			},
			ondataavailable: null,
			onstop: function(e) {

			},
			onstart:function(e) {

			},
			onFlashSecurity: function(e) {

    		},
    		onready: function(e) {

    		},
    		onerror: function(e) {

    		}
		},
		_initialized = false,
		_startRequest = false,
		options = extend(defaults,o);

	include(options.jsLibPath,init);
	
	function init() {
		if (!_initialized)
		{
			Recorder.initialize({
				swfSrc: options.swfObjectPath,
				flashContainer: options.flashContainer,
				onFlashSecurity: function(e) {
					recorder.onFlashSecurity(e);
		    	},
		    	initialized: function(e) {
		    		recorder.onready();
		    		
		    		_initialized = true;

		    		if (_startRequest) {
						start();
					}
		    	}
			});
		}
		
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
		_startRequest = true;
		if (_initialized)
		{
			_startRequest = false;
			Recorder.record({
				start: function(e) {
	    			recorder.onstart(e);
	    		}
	  		});
		}
	}
	function stop() {
		_startRequest = false;
		Recorder.stop();
		recorder.onstop();
		if (typeof recorder.ondataavailable == 'function') {

			if (recorder.dataType == 'url')
			{
				upload();
			}
			else if(recorder.dataType != null)
			{
				handleBinaryData();
			}
		}
	}
	function handleBinaryData() {
		var data = Recorder.audioData();
		if (recorder.dataType == 'raw') {
			return recorder.ondataavailable({
				data: data,
				dataType: recorder.dataType
			});
		};
		Recorder.options.flashContainer.parentNode.removeChild(Recorder.options.flashContainer);

		include(options.encoderPath,function(){
			initEncoder();
			var datauri = WavEncoder.encode(data);
			if (recorder.dataType == 'datauri') {
				return recorder.ondataavailable({
					data: datauri,
					dataType: recorder.dataType
				});
			};
			var audioBlob = new Blob([datauri], {
		        type: 'audio/wav'
		    });
		    if (recorder.dataType == 'blob') {
				return recorder.ondataavailable({
					data: audioBlob,
					dataType: recorder.dataType
				});
			};
		});
		
	}
	function upload(params) {
		if (params == null)
			params = recorder.uploadParams;

		params.success = function(msg) {
			recorder.ondataavailable({
				data:msg,
				dataType: recorder.dataType
			});
			Recorder.options.flashContainer.parentNode.removeChild(Recorder.options.flashContainer);
		};
		params.error = function(msg) {
			recorder.onerror({
				msg:msg
			});
		}
		Recorder.upload(params);
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
	this.onerror = options.onready;
	this.onready = options.onready;

	this.uploadParams = options.uploadParams;
	this.dataType = options.dataType;

	this.start = start;
	this.upload = upload;
	this.stop = stop;
	this.baseUrl = baseUrl;
}