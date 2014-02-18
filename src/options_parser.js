var _ = require('lodash');

function calcPaths(args) {
  var paths = _.reject(args, function(arg) { return _.contains(arg, '--') });
  return paths.length === 0 ? [process.cwd()] : paths;
}

var parser = {
  parse : function(args) {

    return {
      isVerbose: _.contains(args, '--verbose'),
      paths: calcPaths(args),
      color: !_.contains(args, '--no-color')
    };

  }
};

module.exports = parser;
