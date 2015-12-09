(function(global) {

function Parser(html) {
    this._index = 0;
    this._stream = html;
    this._len = this._stream.length;
    this._isTagOpen = false;
    this._isContent = true;
    this._charCurrent = this._stream.charAt(this._index);
    this._charNext = this._stream.charAt(this._index + 1);

    this._bufArray = [];
    this._results = [];

    this._bufArray.getLast = function() {
        return this[this.length - 1];
    };

    this._bufArray.isFirst = function() {
        return this.length === 0;
    };
}

Parser.prototype = {

    opentag: function() {
        this._isTagOpen = true;
        this._isContent = false;
        this.openTagIndex = this._index;
        console.log('opentag');
    },

    closetag: function() {
        this._isTagOpen = false;
    },

    opentext: function() {
        this._openTextIndex = this._index;
        console.log('opentext');
    },

    next: function() {
        this._index++;
        this._charCurrent = this._stream.charAt(this._index);
        this._charNext = this._stream.charAt(this._index + 1);
    },

    onprocessinginstruction: function() {
        // name === '!doctype' && results.push('<' + data + '>');
    },

    oncomment: function() {
        // var comment = '<!--' + data + '-->',
        //     last = bufArray.last();

        // if (!last) {
        //     results.push(comment);
        //     return;
        // }

        // last.content || (last.content = []);
        // last.content.push(comment);
    },

    onopentag: function() {
        this._isContent = true;
        var tag = this._stream.substring(this.openTagIndex, this._index + 1);
        // toNode(tag);
        console.log(tag);
        console.log('onopentag', this.openTagIndex);

        var buf = {};
        buf.tag = tag;
        // if (!isEmpty(attrs)) buf.attrs = attrs;

        this._bufArray.push(buf);
    },

    onclosetag: function() {
        this._isContent = true;
        console.log('onclosetag');

        var buf = this._bufArray.pop();

        if (this._bufArray.isFirst()) {
            this._results.push(buf);
            return;
        }

        var last = this._bufArray.getLast();
        if (!(last.content instanceof Array)) {
            last.content = [];
        }
        last.content.push(buf);
    },

    ontext: function() {
        var text = this._stream.substring(this._openTextIndex, this._index + 1);
        console.log(text);
        console.log('ontext');

        var last = this._bufArray.getLast();
        if (!last) {
            this._results.push(text);
            return;
        }

        last.content || (last.content = []);
        last.content.push(text);
    },

    onend: function() {
        console.log('onend', this._results);
    },

    parse: function() {

        while (this._charCurrent) {
            if (
                !this._isTagOpen &&
                this._charCurrent === '<' &&
                this._charNext !== '/'
            ) this.opentag();
            else if (
                this._isTagOpen &&
                this._charCurrent === '<' &&
                this._charNext === '/'
            ) this.closetag();
            else if (
                this._isTagOpen &&
                this._charCurrent === '>'
            ) this.onopentag();
            else if (
                !this._isTagOpen &&
                this._charCurrent === '>'
            ) this.onclosetag();
            else if (
                (this._isContent && (
                    this._charNext === '<' && /\S/.test(this._charNext + 1))) ||
                (this._isContent && this._charNext === '')
            ) this.ontext();

            if (!this._charNext) this.onend();

            this.next();
        }
        console.log('this._results', this._results);
        return this._results;
    }
};

// function isEmpty(obj) {
//     for (var key in obj) {
//         if (Object.prototype.hasOwnProperty.call(obj, key)) {
//             return false;
//         }
//     }
//     return true;
// }

var parserx = {
    Parser: Parser,
    parse: function(html) {
        return new Parser(html).parse();
    }
};

/* istanbul ignore next */
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
