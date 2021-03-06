var Parser = require('../src/parser'),
    fs = require('fs'),
    markdown = require('markdown').markdown;

describe('parser', function() {
  beforeEach(function() {
    parser = new Parser("fileName");
  });

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
        tree,
        parsedDescribe,
        parsedRoot;

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

        parsedRoot = {
          global: ''
        };

        parsedDescribe = {
          parent: parsedRoot,
          beforeEach: ''
        };
    });

    it('parses out the name', function() {
        var parsedIt = parser.parseSpec(tree, 1, parsedDescribe);

        expect(parsedIt.name).toBe('it 1');
    });

    it('parses out the code', function() {
        var parsedIt = parser.parseSpec(tree, 1, parsedDescribe);

        expect(parsedIt.code).toBe('var x = 10;\nconsole.log("x", x);\nexpect(x).toBe(10);');
    });

    it('adds a function call to run the code', function() {
        spyOn(console, 'log');
        var parsedIt = parser.parseSpec(tree, 1, parsedDescribe);

        parsedIt.fn();

        expect(console.log).toHaveBeenCalledWith('x', 10);
    });
  });

  describe('describe block', function() {
    var text,
        tree,
        parsedRoot;

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

        parsedRoot = {
          global: 'var someGlobal;'
        };

        parsedDescribe = {
          parent: parsedRoot,
          beforeEach: ''
        };
    });

    it('parses the describe name', function() {
        var parsedDescribe = parser.parseDescribe(tree, 1, parsedRoot);

        expect(parsedDescribe.name).toBe('can set a variable to a number');
    });

    it('parsers out the it blocks', function() {
        var parsedDescribe = parser.parseDescribe(tree, 1, parsedRoot);

        expect(parsedDescribe.spec.length).toBe(1);
    });

    it('parses out any code blocks before the it as a beforeEach', function() {
        var parsedDescribe = parser.parseDescribe(tree, 1, parsedRoot);

        expect(parsedDescribe.beforeEach).toContain('someGlobal = 42;');
    });

    it('adds a function call to run the beforeEach', function() {
        var parsedDescribe = parser.parseDescribe(tree, 1, parsedRoot);
        someGlobal = 21;

        parsedDescribe.beforeEachFn();

        expect(someGlobal).toBe(42);
    });

    it('adds a function call to run each it within the describe', function() {
        var itSpy = jasmine.createSpy('it'),
            parsedDescribe = parser.parseDescribe(tree, 1, parsedRoot);

        parsedDescribe.fn(itSpy);

        expect(itSpy).toHaveBeenCalledWith('it 1', jasmine.any(Function));
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

        expect(result.global).toContain('someGlobal = 21;');
    });

    it('adds a function to call for global setup', function() {
        var result = parser.parse(text);

        expect(typeof result.globalFn).toBe('function');
    });

    it('adds a function call to run each describe within the root describe', function() {
        var describeSpy = jasmine.createSpy('describe').andCallFake(function(name, describeFn) {
            describeFn(function() {});
        });
        var result = parser.parse(text);

        result.fn(describeSpy);

        expect(describeSpy).toHaveBeenCalledWith('my title here', jasmine.any(Function));
        expect(describeSpy).toHaveBeenCalledWith('can set a variable to a number', jasmine.any(Function));
    });
  });
});
