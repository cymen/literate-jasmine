require('jasmine-node');

var colors = require('colors'),
    markdown = require('markdown').markdown,
    errorReporter = require('./error-reporter'),
    ROOT_LEVEL = 1,
    DESCRIBE_LEVEL = 2,
    IT_LEVEL = 3,
    parser;

var require = require('./proxy-require')({
  path: 'node_modules'
});

var runsDone = new RegExp(/\sdone()/);

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

var runExample = function(name, code, done) {
  try {
    return eval(code);
  } catch (exception) {
    throw errorReporter.display(parser.fileName, exception, name, code);
  }
}

parser = {
  run: function(name, code) {
    if (runsDone.test(code)) {
      return function(done) { runExample(name, code, done); }
    } else {
      return function() { runExample(name, code); }
    }
  },

  parse: function(text, fileName) {
    var tree = markdown.parse(text),
        root = tree[1],
        complete = {
          name: getName(root),
          describes: []
        };

    this.fileName = fileName;

    if (!parser.validNode(root, 'header', ROOT_LEVEL)) {
      return;
    }

    complete.global = parser.parseCodeBlocks(tree, 1);
    complete.globalFn = parser.run(complete.name, complete.global);

    for (var i = 2; i < tree.length; i++) {
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
    parsedDescribe.beforeEachFn = parser.run(parsedDescribe.name, parsedDescribe.beforeEach);

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
    it.fn = parser.run(it.name, it.code);

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
