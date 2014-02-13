var parser = require('../src/parser'),
    markdown = require('markdown').markdown;

describe('parser', function() {
  describe('it block', function() {
    var text,
        tree;

    beforeEach(function() {
        text = [
          '### it 1',
          'Set x to 10:',
          '',
          '    var x = 10;',
          '    console.log("x", x);',
          '',
          'And then we can expect x to be 10:',
          '',
          '    expect(x).toBe(10);',
          ''
        ].join('\n');
        tree = markdown.parse(text);
    });

    it('parses out the name', function() {
        var it = parser.parseIt(tree, 1);

        expect(it.name).toBe('it 1');
    });

    it('parses out the code', function() {
        var it = parser.parseIt(tree, 1);

        expect(it.code).toBe('var x = 10;\nconsole.log("x", x);\nexpect(x).toBe(10);');
    });

    it('adds the code into a function for calling', function() {
        var it = parser.parseIt(tree, 1);

        expect(typeof it.fn).toBe('function');
    });

    it('has a function that we can actually call', function() {
        spyOn(console, 'log');
        var it = parser.parseIt(tree, 1);

        it.fn();

        expect(console.log).toHaveBeenCalledWith('x', 10);
    });
  });

  describe('describe block', function() {
    var text,
        tree;

    beforeEach(function() {
        text = [
          '## can set a variable to a number',
          '### it 1',
          'Set x to 10:',
          '',
          '    var x = 10;',
          '    console.log("x", x);',
          '',
          'And then we can expect x to be 10:',
          '',
          '    expect(x).toBe(10);',
          ''
        ].join('\n');
        tree = markdown.parse(text);
    });

    it('parses the describe name', function() {
        var describe = parser.parseDescribe(tree, 1);

        expect(describe.name).toBe('can set a variable to a number');
    });

    it('parsers out the it blocks', function() {
        var describe = parser.parseDescribe(tree, 1);

        expect(describe.it.length).toBe(1);
        expect(typeof describe.it[0].fn).toBe('function');
    });
  });

  describe('parse', function() {
    var text,
        tree;

    beforeEach(function() {
        text = [
          '# my title here',
          '## can set a variable to a number',
          '### it 1',
          'Set x to 10:',
          '',
          '    var x = 10;',
          '    console.log("x", x);',
          '',
          'And then we can expect x to be 10:',
          '',
          '    expect(x).toBe(10);',
          ''
        ].join('\n');
    });

    it('parses the root name', function() {
        var result = parser.parse(text);

        expect(result.name).toBe('my title here');
    });

    it('has the expected number of describes', function() {
        var result = parser.parse(text);

        expect(result.describes.length).toBe(1);
    });
  });
});
