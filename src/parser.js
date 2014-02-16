require('jasmine-node');

var markdown = require('markdown').markdown,
    stackTraceParser = require('stack-trace-parser'),
    ROOT_LEVEL = 1,
    DESCRIBE_LEVEL = 2,
    IT_LEVEL = 3,
    parser;

var isHeader = function(node) {
  return node[0] === 'header';
};

var isCodeBlock = function(node) {
  return node[0] === 'code_block';
};

var getName = function(node) {
  return node[2];
};

var getLevel = function(node) {
  return node[1].level;
};

parser = {
  parse: function(text) {
    var tree = markdown.parse(text),
        root = tree[1],
        complete = {
          name: getName(root),
          describes: []
        };

    if (!parser.validNode(root, 'header', ROOT_LEVEL)) {
      return;
    }

    complete.global = parser.parseCodeBlocks(tree, 1);
    complete.globalFn = new Function(complete.global);

    for (var i=2; i < tree.length; i++) {
      var node = tree[i];
      if (parser.validNode(node, 'header', DESCRIBE_LEVEL)) {
        complete.describes.push(parser.parseDescribe(tree, i));
      }
    }

    complete.fn = function(describeFn) {
      describeFn = describeFn || describe;
      complete.globalFn();
      describeFn(complete.name, function() {
        complete.describes.forEach(function(parsedDescribe) {
          describeFn(parsedDescribe.name, parsedDescribe.fn);
        });
      });
    };

    return complete;
  },

  parseDescribe: function(tree, offset) {
    var node = tree[offset],
        parsedDescribe = {
          name: getName(node),
          it: []
        };

    parsedDescribe.beforeEach = parser.parseCodeBlocks(tree, offset);
    parsedDescribe.beforeEachFn = new Function(parsedDescribe.beforeEach);

    while (true) {
      offset += 1;
      var child = tree[offset];

      if (!child || isHeader(child) && getLevel(child) < IT_LEVEL) {
        break;
      }

      if (parser.validNode(child, 'header', IT_LEVEL)) {
        parsedDescribe.it.push(parser.parseIt(tree, offset));
      }
    }

    parsedDescribe.fn = function(itFn) {
      itFn = itFn || it;
      beforeEach(parsedDescribe.beforeEachFn);
      parsedDescribe.it.forEach(function(parsedIt) {
        itFn(parsedIt.name, parsedIt.fn);
      });
    };

    return parsedDescribe;
  },

  parseIt: function(tree, offset) {
    var node = tree[offset],
        it = {
          name: getName(node)
        };

    it.code = parser.parseCodeBlocks(tree, offset);

    it.fn = function() {
      try {
        new Function(it.code)();
      }
      catch (exception) {
        var parsedStackTrace = stackTraceParser.parse(exception);
        if (parsedStackTrace[0].isEval) {
          console.log(it.code);
          console.log('Error in code at', parsedStackTrace[0].evalLineNumber + ':' + parsedStackTrace[0].evalColumnNumber);
        }
        throw exception;
      }
    }

    return it;
  },

  parseCodeBlocks: function(tree, offset) {
    var code_blocks = [];

    while (true) {
      offset += 1;
      var child = tree[offset];

      if (!child || isHeader(child)) {
        break;
      }

      if (isCodeBlock(child)) {
        code_blocks.push(child[1]);
      }
    }

    return code_blocks.join('\n');
  },

  validNode: function(node, type, level) {
    return node[0] === type && node[1].level === level;
  }
};

module.exports = parser;
