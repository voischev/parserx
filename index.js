var html = '<div style="color: red;">content</div>';

Parserx(html);

function Parserx(html) {
    var result = [];
    var node;
    this._stream = html;

    this._index = 0;
    this._len = html.length;
    this._isTagOpen = false;

    this._opentag = function() {
        this._isTagOpen = true;
        this._opentagIndex = this._index;
        console.log('_opentag');
    };

    this._closetag = function() {
        this._isTagOpen = false;
        console.log('_closetag');
    };

    this.onopentag = function() {
        console.log(this._stream.substring(this._opentagIndex, this._index + 1));
        console.log('onopentag', this._opentagIndex);
    };

    this.onclosetag = function() {
        console.log('onclosetag');
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
            !this._isTagOpen &&
            this._charCurrent === '<' &&
            this._charNext !== '/'
        ) this._opentag();
        else if(
            this._isTagOpen &&
            this._charCurrent === '<' &&
            this._charNext === '/'
        ) this._closetag();
        else if(
            this._isTagOpen &&
            this._charCurrent === '>'
        ) this.onopentag();
        else if(
            !this._isTagOpen &&
            this._charCurrent === '>'
        ) this.onclosetag();

        if(!this._charNext) this.onend();

        this._next();
    }

}
