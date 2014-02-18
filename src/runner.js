var find = require('find'),
    fs = require('fs'),
    jasmineNode = require('jasmine-node'),
    parser = require('./parser'),
    _ = require('lodash'),
    parserOutput = [];

var runJasmineOnFiles = function(files) {
  files.forEach(function(fileName) {
    if (!_.contains(fileName, 'node_modules')) {
      var input = fs.readFileSync(fileName, 'utf8');
      parserOutput.push(parser.parse(input, fileName));
    }
  });

  describe('root', function() {
    parserOutput.forEach(function(output) {
      output.fn(describe);
    });
  });

  jasmine.getEnv().execute();
};

var runner = {

  run: function(targetPath) {
    jasmine.getEnv().addReporter(new jasmineNode.TerminalVerboseReporter({color: true}));

    if (targetPath && fs.lstatSync(targetPath).isFile()) {
      runJasmineOnFiles([targetPath]);
    } else {
      var dir = targetPath || process.cwd();
      find.file(/\.md$/i, dir, function(files) {
        if(files.length > 0) {
          runJasmineOnFiles(files);
        } else {
          console.log("No examples found: ", targetPath);
        }
      });
    }
  }

};

module.exports = runner;
