function parserx(html) {
    var bufArray = [],
        results = [];

    bufArray.last = function() {
        return this[this.length - 1];
    };

    var stream = html;

    this._index = 0;
    this._len = stream.length;
    this._isTagOpen = false;
    this._isContent = true;
    this._charCurrent = stream.charAt(this._index);
    this._charNext = stream.charAt(this._index + 1);

    this._opentag = function() {
        this._isTagOpen = true;
        this._isContent = false;
        this._openTagIndex = this._index;
        console.log('_opentag');
    };

    this._closetag = function() {
        this._isTagOpen = false;
        console.log('_closetag');
    };

    this._opentext = function() {
        this._openTextIndex = this._index;
        console.log('_opentext');
    };

    this._next = function() {
        this._index++;
        this._charCurrent = stream.charAt(this._index);
        this._charNext = stream.charAt(this._index + 1);
    };

    this.onprocessinginstruction = function() {
        // name === '!doctype' && results.push('<' + data + '>');
    };

    this.oncomment = function() {
        // var comment = '<!--' + data + '-->',
        //     last = bufArray.last();

        // if (!last) {
        //     results.push(comment);
        //     return;
        // }

        // last.content || (last.content = []);
        // last.content.push(comment);
    };

    this.onopentag = function() {
        this._isContent = true;
        var tag = stream.substring(this._openTagIndex, this._index + 1);
        toNode(tag);
        console.log(tag);
        console.log('onopentag', this._openTagIndex);

        var buf = {};
        buf.tag = tag;
        // if (!isEmpty(attrs)) buf.attrs = attrs;

        bufArray.push(buf);
    };

    this.onclosetag = function() {
        this._isContent = true;
        console.log('onclosetag');

        var buf = bufArray.pop();

        if (bufArray.length === 0) {
            results.push(buf);
            return;
        }

        var last = bufArray.last();
        if (!(last.content instanceof Array)) {
            last.content = [];
        }
        last.content.push(buf);
    };

    this.ontext = function() {
        var text = stream.substring(this._openTextIndex, this._index + 1);
        console.log(text);
        console.log('ontext');

        var last = bufArray.last();
        if (!last) {
            results.push(text);
            return;
        }

        last.content || (last.content = []);
        last.content.push(text);
    };

    this.onend = function() {
        console.log('onend', results);
    };

    while (this._charCurrent) {
        if (
            !this._isTagOpen &&
            this._charCurrent === '<' &&
            this._charNext !== '/'
        ) this._opentag();
        else if (
            this._isTagOpen &&
            this._charCurrent === '<' &&
            this._charNext === '/'
        ) this._closetag();
        else if (
            this._isTagOpen &&
            this._charCurrent === '>'
        ) this.onopentag();
        else if (
            !this._isTagOpen &&
            this._charCurrent === '>'
        ) this.onclosetag();
        else if (
            this._isContent &&
            this._charNext === ''
        ) this.ontext();

        if (!this._charNext) this.onend();

        this._next();
    }

    return results;

    // function whitespase(str) {

    // }

    function toNode(str) {
        console.log(str);
        // str.replase(/^</, '');
        // str.replase(/>$/, '');
        // str.replase(/\n/g, '');

        // return {
        //     tag: 'sdf'
        // };
    }

}

// function isEmpty(obj) {
//     for (var key in obj) {
//         if (Object.prototype.hasOwnProperty.call(obj, key)) {
//             return false;
//         }
//     }
//     return true;
// }

/* istanbul ignore next */
(function(global) {

var defineAsGlobal = true;

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = parserx;
    defineAsGlobal = false;
}

if (typeof modules === 'object' && typeof modules.define === 'function') {
    modules.define('postHTMLRender', function(provide) {
        provide(parserx);
    });
    defineAsGlobal = false;
}

if (typeof define === 'function') {
    define(function(require, exports, module) {
        module.exports = parserx;
    });
    defineAsGlobal = false;
}

defineAsGlobal && (global.parserx = parserx);

})(typeof window !== 'undefined'? window: global);
