/* jshint mocha: true, node: true, maxlen: false */
var parserx = require('../lib/parserx'),
    expect = require('chai').expect;

function parse(html) {
    console.log('INPUT HTML: ', html);
    var result = parserx.parse(html);
    console.log('OUTPUT TREE: ', result);
    return result;
}

describe('Parse', function() {
    it('`Text`', function() {
        expect(parse('Text')).to.eql(['Text']);
    });

    it('`Text < `', function() {
        expect(parse('Text < ')).to.eql(['Text < ']);
    });

    it('`Text <tag `', function() {
        // Error parse
        expect(parse('Text <tag ')).to.eql(['Text ']);
    });

    it('`Text <tag text`', function() {
        // Error parse
        expect(parse('Text <tag text')).to.eql(['Text ']);
    });

    it('`Text <tag <tag>`', function() {
        expect(
            parse('Text <tag <tag>')).to.eql([
                'Text ',
                { tag: 'tag', attrs: { '<tag': true }}
            ]);
    });

    it('`Text <tag>`', function() {
        // Error parse if tag not single tag
        expect(parse('Text <tag>')).to.eql([
            'Text ', { tag: 'tag' }
        ]);
    });

    it('`Text <img>`', function() {
        // Error parse if tag not single tag
        expect(parse('Text <img>')).to.eql(['Text ', { tag: 'img' }]);
    });

    it('`Text <tag></tag>`', function() {
        expect(parse('Text <tag></tag>')).to.eql(['Text ', { tag: 'tag' }]);
    });

    it('`Text </tag>`', function() {
        // Error parse
        expect(parse('Text </tag>')).to.eql(['Text ']);
    });

    // Attrs
    it('`<tag attr>`', function() {
        // Error parse
        expect(parse('<tag attr>')).to.eql([{
            tag: 'tag', attrs: { attr: true }}
        ]);
    });

    it('`<tag attr=1>`', function() {
        // Error parse
        expect(parse('<tag attr=1>')).to.eql([{
            tag: 'tag', attrs: { attr: '1' }}
        ]);
    });

    it('`<tag attr=111>`', function() {
        // Error parse
        expect(parse('<tag attr=111>')).to.eql([{
            tag: 'tag', attrs: { attr: '111' }}
        ]);
    });

    it('`<tag attr="1">`', function() {
        // Error parse
        expect(parse('<tag attr="1">')).to.eql([{
            tag: 'tag', attrs: { attr: '1' }}
        ]);
    });

/*
    it('should be parse comment', function() {
        expect(parse('<!--comment-->')).to.eql(['<!--comment-->']);
    });

    it('should be parse comment in content', function() {
        expect(parse('<div><!--comment--></div>')).to.eql([{tag: 'div', content: ['<!--comment-->']}]);
    });

    it('should be parse doctype', function() {
        expect(parse('<!doctype html>')).to.eql(['<!doctype html>']);
    });

    it('should be parse tag', function() {
        expect(parse('<html></html>')).to.eql([{ tag: 'html' }]);
    });

    it('should be parse doctype and tag', function() {
        expect(parse('<!doctype html><html></html>')).to.eql(['<!doctype html>', { tag: 'html' }]);
    });

    it('should be parse tag attrs', function() {
        expect(parse('<div id="id" class="class"></div>')).to.eql([{
            tag: 'div', attrs: { id: 'id', class: 'class'} }
        ]);
    });

    it('should be parse text in content', function() {
        expect(parse('<div>Text</div>')).to.eql([{ tag: 'div', content: ['Text'] }]);
    });

    it('should be parse not a single node in tree', function() {
        expect(parse('<span>Text1</span><span>Text2</span>Text3')).to.eql([
            { tag: 'span', content: ['Text1']}, { tag: 'span', content: ['Text2']}, 'Text3'
        ]);
    });

    it('should be parse not a single node in parent content', function() {
        expect(parse('<div><span>Text1</span><span>Text2</span>Text3</div>')).to.eql([
            { tag: 'div', content: [{ tag: 'span', content: ['Text1']}, { tag: 'span', content: ['Text2']}, 'Text3'] }
        ]);
    });
*/
});
