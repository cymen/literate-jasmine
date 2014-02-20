var find = require('find'),
    fs = require('fs'),
    jasmineNode = require('jasmine-node'),
    parser = require('./parser'),
    _ = require('lodash');

function runJasmineOnFiles(files) {
  var parserOutput = _(files).map(function(fileName) {
    if (!_.contains(fileName, 'node_modules')) {
      var input = fs.readFileSync(fileName, 'utf8');
      return new parser(fileName).parse(input);
    }
  }).compact().value();

  describe('all', function() {
    _.each(parserOutput, function(output) {
      output.fn(describe);
    });
  });

  jasmine.getEnv().execute();
};

function getSources(paths) {
  return _(paths).map(function(path) {
    if (path && fs.lstatSync(path).isFile()) {
      return path;
    } else {
      return find.fileSync(/\.md$/i, path);
    }
  }).flatten();
}

var runner = function(options) {
  this.options = options;
  this.reporter = options.isVerbose ? jasmineNode.TerminalVerboseReporter :
    jasmineNode.TerminalReporter;

  this.run = function() {
    jasmine.getEnv().addReporter(new this.reporter({color: options.color}));
    runJasmineOnFiles(getSources(options.paths));
  }
};

module.exports = runner;
