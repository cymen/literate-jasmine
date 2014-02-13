var lodash = require('lodash'),
    markdown = require('markdown').markdown,
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

    for (var i=2; i < tree.length; i++) {
      var node = tree[i];
      if (parser.validNode(node, 'header', DESCRIBE_LEVEL)) {
        complete.describes.push(parser.parseDescribe(tree, i));
      }
    }

    return complete;
  },

  parseDescribe: function(tree, offset) {
    var node = tree[offset],
        describe = {
          name: node[2],
          it: []
        };

    while (true) {
      offset += 1;
      var child = tree[offset];

      if (!child || child[0] === 'header' && child[1] < IT_LEVEL) {
        break;
      }

      if (parser.validNode(child, 'header', IT_LEVEL)) {
        describe.it.push(parser.parseIt(tree, offset));
      }
    }

    return describe;
  },

  parseIt: function(tree, offset) {
    var node = tree[offset],
        it = {
          name: node[2]
        },
        code_blocks = [];

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

    it.code = code_blocks.join('\n');

    it.fn = function() {
      eval(it.code);
    };

    return it;
  },

  validNode: function(node, type, level) {
    return node[0] === type && node[1].level === level;
  }
};

module.exports = parser;
