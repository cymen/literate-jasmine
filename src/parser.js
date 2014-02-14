require('jasmine-node');

var markdown = require('markdown').markdown,
    ROOT_LEVEL = 1,
    DESCRIBE_LEVEL = 2,
    IT_LEVEL = 3,
    parser;

parser = {
  parse: function(text) {
    var tree = markdown.parse(text),
        root = tree[1],
        complete = {
          name: root[2],
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
          name: node[2],
          it: []
        };

    parsedDescribe.beforeEach = parser.parseCodeBlocks(tree, offset);
    parsedDescribe.beforeEachFn = new Function(parsedDescribe.beforeEach);

    while (true) {
      offset += 1;
      var child = tree[offset];

      if (!child || child[0] === 'header' && child[1].level < IT_LEVEL) {
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
          name: node[2]
        };

    it.code = parser.parseCodeBlocks(tree, offset);

    it.fn = new Function(it.code);

    return it;
  },

  parseCodeBlocks: function(tree, offset) {
    var code_blocks = [];

    while (true) {
      offset += 1;
      var child = tree[offset];

      if (!child || child[0] === 'header') {
        break;
      }

      if (child[0] === 'code_block') {
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
