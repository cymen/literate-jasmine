require('jasmine-node');

var colors = require('colors'),
    markdown = require('markdown').markdown,
    errorReporter = require('./error-reporter'),
    ROOT_LEVEL = 1,
    DESCRIBE_LEVEL = 2,
    SPEC_LEVEL = 3;

var require = require('./proxy-require')({
  path: 'node_modules'
});

var runsDone = new RegExp(/\sdone()/);

function isAsync(code) {
  return runsDone.test(code);
}

function isHeader(node) {
  return node[0] === 'header';
};

function isCodeBlock(node) {
  return node[0] === 'code_block';
};

function getName(node) {
  return node[2];
};

function getLevel(node) {
  return node[1].level;
};

function runExample(fileName, name, code, done) {
  try {
    return eval(code);
  } catch (exception) {
    throw errorReporter.display(fileName, exception, name, code);
  }
}

function validNode(node, type, level) {
  return node[0] === type && node[1].level === level;
};

var Parser = function(fileName) {
  this.fileName = fileName;

  this.parse = function(text) {
    var tree = markdown.parse(text),
        root = tree[1],
        complete = {
          name: getName(root),
          describes: []
        };

    if (!validNode(root, 'header', ROOT_LEVEL)) {
      return;
    }

    complete.global   = this.parseCodeBlocks(tree, 1);
    complete.globalFn = this.run(complete.name, complete.global);

    for (var i = 2; i < tree.length; i++) {
      var node = tree[i];
      if (validNode(node, 'header', DESCRIBE_LEVEL)) {
        complete.describes.push(this.parseDescribe(tree, i));
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
  };

  this.run = function(name, code) {
    var fileName = this.fileName;
    if (isAsync(code)) {
      return function(done) { runExample(fileName, name, code, done); }
    } else {
      return function() { runExample(fileName, name, code); }
    }
  };

  this.parseDescribe = function(tree, offset) {
    var node = tree[offset],
        parsedDescribe = {
          name: getName(node),
          spec: []
        };

    parsedDescribe.beforeEach   = this.parseCodeBlocks(tree, offset);
    parsedDescribe.beforeEachFn = this.run(parsedDescribe.name, parsedDescribe.beforeEach);

    while (true) {
      offset += 1;
      var child = tree[offset];

      if (!child || isHeader(child) && getLevel(child) < SPEC_LEVEL) {
        break;
      }

      if (validNode(child, 'header', SPEC_LEVEL)) {
        parsedDescribe.spec.push(this.parseSpec(tree, offset));
      }
    }

    parsedDescribe.fn = function(specFn) {
      specFn = specFn || it;
      beforeEach(parsedDescribe.beforeEachFn);
      parsedDescribe.spec.forEach(function(parsedSpec) {
        specFn(parsedSpec.name, parsedSpec.fn);
      });
    };

    return parsedDescribe;
  };

  this.parseSpec = function(tree, offset) {
    var node = tree[offset],
        spec = {
          name: getName(node)
        };

    spec.code = this.parseCodeBlocks(tree, offset);
    spec.fn   = this.run(spec.name, spec.code);

    return spec;
  };

  this.parseCodeBlocks = function(tree, offset) {
    var codeBlocks = [];

    while (true) {
      offset += 1;
      var child = tree[offset];

      if (!child || isHeader(child)) {
        break;
      }

      if (isCodeBlock(child)) {
        codeBlocks.push(child[1]);
      }
    }

    return codeBlocks.join('\n');
  };
};

module.exports = Parser;
