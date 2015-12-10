(function(global) {

function Parser(html) {
    this._index = 0;
    this._stream = html;
    this._len = this._stream.length;
    this._isTagStart = false;
    this._isTextStart = false;
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

    _opentag: function() {
        this._isTagStart = true;
        this.openTagIndex = this._index;
        console.log('_opentag');
    },

    _closetag: function() {
        this._isTagStart = false;
    },

    _opentext: function() {
        this._isTextStart = true;
        this._openTextIndex = this._index;
        console.log('_opentext');
    },

    _next: function() {
        this._index++;
        this._charCurrent = this._stream.charAt(this._index);
        this._charNext = this._stream.charAt(this._index + 1);
    },

    _parseTag: function(str) {
        var RE = /([\w-]+)|['"]{1}([^'"]*)['"]{1}/g,
            i = 0,
            bufKey,
            res = { tag: '' };

        // var shortTags = {
        //     area: true,
        //     base: true,
        //     br: true,
        //     col: true,
        //     embed: true,
        //     hr: true,
        //     img: true,
        //     input: true,
        //     keygen: true,
        //     link: true,
        //     menuitem: true,
        //     meta: true,
        //     param: true,
        //     source: true,
        //     track: true,
        //     wbr: true
        // };

        str.replace(RE, function(match) {
            console.log('!!!!!!!!!!!!!', match);
            if (i === 0) {
                // if (shortTags[match] || srt.charAt(str.length - 2) === '/') {
                //     res.voidElement = true;
                // }
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
        });

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

    onopentag: function(fn) {
        this._isContent = true;
        var str = this._stream.substring(this.openTagIndex, this._index + 1);
        var node = this._parseTag(str);
        console.log('onopentag', node);

        this._bufArray.push(node);

        fn && fn(node);

        return this;
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
        this._isContent = true;
        this._isTextStart = false;
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
        console.log('onend: ', this._results);
        console.log('\n********\n\nRESULT THIS OBJ:\n');
        console.log(this);
        console.log('\n********\n');
        // if (!this._results.length && this._bufArray.length && this._isTagStart)
        //     this._results = this._results.concat(this._bufArray); // TODO: fix
        console.log('RESUTL2 OBJ: ', this._results);
    },

    parse: function() {

        while (this._charCurrent) {
            var str = this._charCurrent + this._charNext;
            switch (str) {
                case (/<\S/.test(str)):
                    break;
                case '< ':
                    break;
                case '</':
                    break;
                case '>': //TODO: WOW!!!
                    break;
                case '':
                    this.onend();
                    break;
            }

            this._next();

            if (
                !this._isTagStart &&
                this._charCurrent === '<' &&
                this._charNext !== '/' &&
                this._charNext !== ' '
            ) this._opentag();
            else if (
                this._isTagStart &&
                this._charCurrent === '<' &&
                this._charNext === '/'
            ) this._closetag();
            else if (
                this._isTagStart &&
                this._charCurrent === '>'
            ) this.onopentag();
            else if (
                !this._isTagStart &&
                this._charCurrent === '>'
            ) this.onclosetag();
            else if (
                this._isContent &&
                !this._isTextStart &&
                !(
                  this._charNext === '<' && /\S/.test(this._charNext + 1) ||
                  (this._isContent && this._charNext === '')
                )
            ) this._opentext();
            else if (
                (this._isTagStart &&
                !this._isTextStart) ||
                (this._isTextStart && !this._charNext )
            ) this.ontext();

            if (!this._charNext) this.onend();

            this._next();
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
