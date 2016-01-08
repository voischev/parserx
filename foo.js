var h = '<h1><h2><h3></h3><h3></h3></h2></h1>';

function parse(str) {
    var level = 0,
        index = 0,
        result = [],
        startTagIndex = 0,
        startContentIndex = 0,
        startTag = false;

    while (str[index]) {
        var cur = str[index],
            curNext = str[index + 1];

        if (cur === '<' && /[A-Za-z]/.test(curNext)) {
            startTagIndex = index;
            startTag = true;
        }

        if (cur === '>' && startTag) {
            if (!level) {
                var tag = str.substring(startTagIndex, index + 1);
                result.push([tag]);

                startContentIndex = index + 1;
            }
            level++;
        }

        if (cur === '<' && curNext === '/') {
            level--;
            startTag = false;
            if (!level) {
                var content = str.substring(startContentIndex, index);
                result[result.length - 1]
                    .push(parse(content));
            }
        }

        index++;
    }

    return result;
}

function toPostHTMLTree(tree) {
    var result = [];

    for (var i = 0, len = tree.length; i < len; i++) {
        var node = tree[i];
        result.push(parseNode(node));
    }

    return result;

    function parseNode(node) {
        if (!node[0]) return node[1];

        var strArr = node[0].replace(/^</, '').replace(/>$/, '').split(' '),
            res = { tag: '' };

        for (var i = 0, len = strArr.length; i < len; i++) {
            var match = strArr[i];
            if (i === 0) {
                // if (this.getShortTags().indexOf(match) !== -1) {
                    // this._isShortTag = true;
                // }
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

        if (node[1]) res.content = toPostHTMLTree(node[1]);

        return res;
    }
}

console.log(h);
console.log(parse(h));
console.log(JSON.stringify(toPostHTMLTree(parse(h))));
