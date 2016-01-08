(function(global) {

function Parser(html) {

    this._index = 0;
    this._level = 0;
    this._stream = html;
    this._len = this._stream.length;
    this._isTagStart = false;
    this._isShortTag = false;
    this._isTextNode = false;
    this._isContent = true;
    this._isDirection = false;
    this._charCurrent = this._stream.charAt(this._index);
    this._charNext = this._stream.charAt(this._index + 1);
    this._charPrev = this._stream.charAt(this._index - 1);
    this._shortTags = [
        'area',
        'base',
        'basefont',
        'br',
        'col',
        'command',
        'embed',
        'frame',
        'hr',
        'img',
        'input',
        'isindex',
        'keygen',
        'link',
        'meta',
        'param',
        'source',
        'track',
        'wbr',
        'path',
        'circle',
        'ellipse',
        'line',
        'rect',
        'use',
        'stop',
        'polyline',
        'polygon'
    ];

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
        this._openTagIndex = this._index;
        console.log('_opentag');
    },

    _closetag: function() {
        this._isTagStart = false;
        this._isContent = false;
        this._isTextNode = false;
        this._level--;
        console.log('_closetag', 'LEVEL:', this._level);
    },

    _opentext: function() {
        this._isTextNode = true;
        this._openTextIndex = this._index;
        console.log('_opentext');
    },

    _direction: function() {
        console.log('_direction');
        this._isDirection = true;
        this._isContent = false;
        this._openDidectionIndex = this._index;
    },

    _content: function() {
        this._isTagStart = false;
        this._level++;
        console.log('_content', 'LEVEL:', this._level);
    },

    _next: function() {
        this._index++;
        this._charCurrent = this._stream.charAt(this._index);
        this._charNext = this._stream.charAt(this._index + 1);
        this._charPrev = this._stream.charAt(this._index - 1);
    },

    _parseNode: function(str) {
        var strArr = str.replace(/^</, '').replace(/>$/, '').split(' '),
            res = { tag: '' };

        for (var i = 0, len = strArr.length; i < len; i++) {
            var match = strArr[i];
            if (i === 0) {
                if (this.getShortTags().indexOf(match) !== -1) {
                    this._isShortTag = true;
                }
                res.tag = match;
            } else {
                var attr = match.split('=');
                if (!res.attrs) res.attrs = {};
                res.attrs[attr[0]] = attr[1] ?
                    attr[1]
                        .replace(/^['"]/, '')
                        .replace(/['"]$/, '') :
                    true;
            }
        }

        return res;
    },

    ondirection: function() {
        console.log('ondirection');
        var str = this
            ._stream
            .substring(this._openDirectionIndex, this._index + 1);

        this._results.push(str);

        this._isDirection = false;
    },

    onopentag: function() {
        console.log('onopentag');
        this._openContentIndex = this._index + 1;
        var str = this
            ._stream
            .substring(this._openTagIndex, this._index + 1);

        this._results.push(this._parseNode(str));

        if (this._isShortTag) {
            this.onclosetag();
        }

        this._isTagStart = false;
    },

    onclosetag: function() {
        console.log('onclosetag');
        this._isContent = true;

        var buf = this._bufArray.pop();

        if (buf && this._bufArray.isFirst()) {
            this._results.push(buf);
            return;
        }

        var last = this._bufArray.getLast();
        if (last && !(last.content instanceof Array)) {
            last.content = [];
        }
        // last.content.push(buf);
    },

    ontext: function() {
        console.log('ontext');
        var text = this._stream.substring(this._openTextIndex, this._index);

        this._results.push(text);
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
            this._isTagStart &&
            this._shortTags
        ) this._results = this._results.concat(this._bufArray);

        console.log('RESUTL2 OBJ: ', this._results);
    },

    parse: function() {
        do {
            switch (this._charCurrent) {
                case '<':
                    if (
                        /\S/.test(this._charNext) &&
                        !this._isTagStart &&
                        this._charNext !== '/'
                    ) {
                        if (this._isTextNode) this.ontext();
                        if (/[A-Za-z0-9]/.test(this._charNext)) {
                            this._opentag();
                        } else {
                            this._direction();
                        }
                    } else if (this._charNext === '/' && this._isContent) {
                        this.ontext();
                    }
                    break;
                case '/':
                    if (this._charPrev === '<' || this._charNext === '>')
                        this._closetag();
                    break;
                case '>':
                    if (!this._isContent) {
                        if (this._isTagStart) {
                            this.onopentag();
                            this._content();
                            if (this._isShortTag) {
                                this.onclosetag();
                            }
                        } else if (this._isDirection) {
                            this.ondirection();
                        } else {
                            this.onclosetag();
                        }
                    }
                    break;
                case '':
                    if (this._isTextNode) this.ontext();
                    this.onend();
                    break;
                default:
                    if (this._isContent && !this._isTextNode)
                        this._opentext();
            }
            this._next();
        } while (this._charPrev);

        return this._results;
    },

    setShortTags: function(shortTags) {
        this._shortTags = shortTags;
        return this;
    },

    getShortTags: function() {
        return this._shortTags;
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
