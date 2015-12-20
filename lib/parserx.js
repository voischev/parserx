(function(global) {

function Parser(html) {
    this._index = 0;
    this._stream = html;
    this._len = this._stream.length;
    this._isTagStart = false;
    this._isShortTag = false;
    this._isTextNode = false;
    this._isContent = true;
    this._charCurrent = this._stream.charAt(this._index);
    this._charNext = this._stream.charAt(this._index + 1);
    this._charPrev = this._stream.charAt(this._index - 1);

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

    _opentag: function() {
        this._isTagStart = true;
        this._isContent = false;
        this._isTextNode = false;
        this.openTagIndex = this._index;
        console.log('_opentag');
    },

    _closetag: function() {
        this._isTagStart = false;
        this._isContent = false;
        this._isTextNode = false;
        if (this._charCurrent === '/' && this._charNext === '>')
            this._isShortTag = true;
        console.log('_closetag');
    },

    _opentext: function() {
        this._isTextNode = true;
        this._openTextIndex = this._index;
        console.log('_opentext');
    },

    _oncontent: function() {
        this._isTagStart = false;
        console.log('_oncontent');
    },

    _next: function() {
        this._index++;
        this._charCurrent = this._stream.charAt(this._index);
        this._charNext = this._stream.charAt(this._index + 1);
        this._charPrev = this._stream.charAt(this._index - 1);
    },

    _parseTag: function(str) {
        var RE = /([\w-]+)|['"]{1}([^'"]*)['"]{1}/g,
            i = 0,
            bufKey,
            res = { tag: '' };

        var shortTags = {
            area: true,
            base: true,
            basefont: true,
            br: true,
            col: true,
            command: true,
            embed: true,
            frame: true,
            hr: true,
            img: true,
            input: true,
            isindex: true,
            keygen: true,
            link: true,
            meta: true,
            param: true,
            source: true,
            track: true,
            wbr: true,
            path: true,
            circle: true,
            ellipse: true,
            line: true,
            rect: true,
            use: true,
            stop: true,
            polyline: true,
            polygon: true
        };

        str.replace(RE, function(match) {
            if (i === 0) {
                console.log('RRRR', shortTags[match]);
                if (shortTags[match]) {
                    this._isShortTag = true;
                    console.log('TTTTTTTT');
                }
                res.tag = match;
            } else if (i % 2) {
                if (!res.attrs) res.attrs = {};
                res.attrs[bufKey = match] = true;
            } else {
                res.attrs[bufKey] = match
                    .replace(/^['"]/, '')
                    .replace(/['"]$/, '');
            }
            i++;
        }.bind(this));

        return res;
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
        console.log('onopentag');
        var str = this._stream.substring(this.openTagIndex, this._index);
        var node = this._parseTag(str);

        this._results.push(node);

        if (this._isShortTag) {
            this.onclosetag();
        }

        this._isTagStart = false;
    },

    onclosetag: function() {
        console.log('onclosetag');
        this._isContent = true;

        var buf = this._bufArray.pop();

        if (this._bufArray.isFirst()) {
            this._results.push(buf);
            return;
        }

        var last = this._bufArray.getLast();
        if (!(last.content instanceof Array)) {
            last.content = [];
        }
        // last.content.push(buf);
    },

    ontext: function() {
        console.log('ontext');
        var text = this._stream.substring(this._openTextIndex, this._index);

        // var last = this._bufArray.getLast();
        this._results.push(text);
        // if (!last) {
        //     this._results.push(text);
        //     return;
        // }

        // last.content || (last.content = []);
        // last.content.push(text);
        this._isTextNode = false;
    },

    onend: function() {
        console.log('onend: ', this._results);
        console.log('\n********\n\nRESULT THIS OBJ:\n');
        console.log(this);
        console.log('\n********\n');
        if (
            !this._results.length &&
            this._bufArray.length &&
            this._isTagStart
        ) this._results = this._results.concat(this._bufArray);

        console.log('RESUTL2 OBJ: ', this._results);
    },

    parse: function() {
        do {
            switch (this._charCurrent) {
                case '<':
                    if (/\S/.test(this._charNext)) {
                        if (this._isTextNode) this.ontext();
                        this._opentag();
                    }
                    break;
                case '/':
                    if (this._charPrev === '<' || this._charNext === '>')
                        this._closetag();
                    break;
                case '>':
                    if (this._isTagStart) {
                        this.onopentag();
                        if (this._isShortTag) this.onclosetag();
                    } else if (!this._isContent || this._isShortTag) {
                        this.onclosetag();
                        this._oncontent();
                    }
                    break;
                case '':
                    if (this._isTextNode) this.ontext();
                    if (this._isTagStart) this.onopentag();
                    this.onend();
                    break;
                default:
                    if (this._isContent && !this._isTextNode)
                        this._opentext();
            }
            this._next();
        } while (this._charPrev);

        console.log('this._results', this._results);
        return this._results;
    }
};

Parser.prototype.constructor = Parser;

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
