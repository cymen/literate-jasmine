var jshint = require('jshint').JSHINT,
    colors = require('colors');

module.exports = function(code) {
  var options = {
      devel: true,
      node: true,
      predef: ['expect', 'done'],
      undef: true
    },
    isValid = jshint(code, options);

  if (!isValid) {
    var errorsByLineNumber = {};
    jshint.errors.map(function(error) {
      errorsByLineNumber[error.line] = error.reason;
    });

    code.split('\n').forEach(function(line, index) {
      var lineNumber = index + 1;
      if (errorsByLineNumber[lineNumber]) {
        line = line.yellow + '\t' + ('// ERROR: ' + errorsByLineNumber[lineNumber]).red
      }
      console.log(line);
    });
  }

  return isValid;
};
