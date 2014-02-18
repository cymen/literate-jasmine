var colors = require('colors'),
    stackTraceParser = require('stack-trace-parser');

var makeFileNameRelative = function(fileName) {
  return fileName.replace(process.cwd(), '.');
};

var reporter = {
  display: function(fileName, exception, name, code) {
    var parsedStackTrace = stackTraceParser.parse(exception);
    if (parsedStackTrace[0].isEval) {
      console.log('\n');
      console.log(exception.toString().red, 'thrown from', name.red, 'in', makeFileNameRelative(fileName).red + ':');
      console.log('. . . . .');
      var errorOnLineNumber = parsedStackTrace[0].evalLineNumber - 1;
      code.split('\n').forEach(function(line, index) {
        if (index == errorOnLineNumber) {
          line = line.red;
        }
        console.log(line);
      });
      console.log('. . . . .\n');
    }

    exception.message += ' (' + makeFileNameRelative(fileName) + ')';
    return exception;
  }
};

module.exports = reporter;
