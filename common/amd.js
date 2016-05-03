// https://github.com/streamproc/MediaStreamRecorder/issues/42
(function(root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('msr'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['msr'], function() {
            return (root.returnExportsGlobal = factory(MediaStreamRecorder));
        });
    } else {
        // Global Variables
        root.returnExportsGlobal = factory(root.MediaStreamRecorder);
    }
}(this, function() {
    return MediaStreamRecorder;
}));
