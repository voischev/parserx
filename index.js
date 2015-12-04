function Parserx(html) {
    var result = [];
    var node;
    this._stream = html;

    this._index = 0;
    this._len = html.length;
    this._isNodeOpen = false;

    this._opennode = function() {
        this._isNodeOpen = true;
        this._openNodeIndex = this._index;
        console.log('_opennode');
    };

    this._closenode = function() {
        this._isNodeOpen = false;
        console.log('_closenode');
    };

    this.onopennode = function() {
        console.log(this._stream.substring(this._openNodeIndex, this._index + 1));
        console.log('onopennode', this._openNodeIndex);
    };

    this.onclosenode = function() {
        console.log('onclosenode');
    };

    this.onend = function onend() {
        console.log('onend');
    };

    this._charCurrent = this._stream.charAt(this._index);
    this._charNext = this._stream.charAt(this._index + 1);

    this._next = function() {
        this._index++;
        this._charCurrent = this._stream.charAt(this._index);
        this._charNext = this._stream.charAt(this._index + 1);
    };

    while(this._charCurrent) {
        if(
            !this._isNodeOpen &&
            this._charCurrent === '<' &&
            this._charNext !== '/'
        ) this._opennode();
        else if(
            this._isNodeOpen &&
            this._charCurrent === '<' &&
            this._charNext === '/'
        ) this._closenode();
        else if(
            this._isNodeOpen &&
            this._charCurrent === '>'
        ) this.onopennode();
        else if(
            !this._isNodeOpen &&
            this._charCurrent === '>'
        ) this.onclosenode();

        if(!this._charNext) this.onend();

        this._next();
    }

}

/* istanbul ignore next */
(function(global) {

var defineAsGlobal = true;

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = Parserx;
    defineAsGlobal = false;
}

if (typeof modules === 'object' && typeof modules.define === 'function') {
    modules.define('postHTMLRender', function(provide) {
        provide(Parserx);
    });
    defineAsGlobal = false;
}

if (typeof define === 'function') {
    define(function(require, exports, module) {
        module.exports = Parserx;
    });
    defineAsGlobal = false;
}

defineAsGlobal && (global.Parserx = Parserx);

})(typeof window !== 'undefined'? window: global);
