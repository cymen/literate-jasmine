var parser = require('../src/parser'),
    markdown = require('markdown').markdown;

describe('parser', function() {
  describe('code block(s)', function() {
    it('parses out the code block', function() {
        var text = [
          '',
          '    console.log("hi!");',
          ''
        ].join('\n');
        var tree = markdown.parse(text);

        var code = parser.parseCodeBlocks(tree, 0);

       expect(code).toContain('console.log("hi!");');
    });

    it('parses out the comments between code blocks', function() {
        var text = [
          '',
          '    var i = 10;',
          '',
          'And now set x to 20:',
          '',
          '    var x = 20;',
          ''
        ].join('\n');
        var tree = markdown.parse(text);

        var code = parser.parseCodeBlocks(tree, 0);

       expect(code).toContain('var i = 10;');
       expect(code).toContain('var x = 20;');
       expect(code).not.toContain('And now set x to 20:');
    });

    it('stops looking for additional code blocks when it hits a header', function() {
        var text = [
          '',
          '    var i = 10;',
          '',
          '### And now for something different:',
          '',
          '    var answer = 42;'
        ].join('\n');
        var tree = markdown.parse(text);

        var code = parser.parseCodeBlocks(tree, 0);

       expect(code).toContain('var i = 10;');
       expect(code).not.toContain('var answer = 42;');
       expect(code).not.toContain('And now for something different');
    });
  });

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
          '',
          '    someGlobal = 42;',
          '',
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

    it('parses out any code blocks before the it as a beforeEach', function() {
        var describe = parser.parseDescribe(tree, 1);

        expect(describe.beforeEach).toContain('someGlobal = 42;');
    });

    it('adds a beforeEachFn which is the function to be run as a beforeEach', function() {
        var describe = parser.parseDescribe(tree, 1);
        someGlobal = 21; // intentionally not using var so we hit global!

        expect(someGlobal).toBe(21);

        describe.beforeEachFn();

        expect(someGlobal).toBe(42);
    });
  });

  describe('parse', function() {
    var text,
        tree;

    beforeEach(function() {
        text = [
          '# my title here',
          '',
          '    var someGlobal = 21;',
          '    someOtherRealGlobal = 500;',
          '',
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
          '',
          'And we can change the value of global someGlobal:',
          '',
          '    someGlobal = 42;',
          '',
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

    it('parses any code blocks before first header/describe as beforeEach', function() {
        var result = parser.parse(text);

        expect(result.beforeEach).toContain('someGlobal = 21;');
    });

    it('puts the parsed beforeEach as beforeEachFn on the returned object', function() {
        var result = parser.parse(text);

        result.beforeEachFn();

        expect(someOtherRealGlobal).toBe(500);
    });
  });
});
