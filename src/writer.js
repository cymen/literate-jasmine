var fs = require('fs');

var indentLine = function(text, numberOfSpaces) {
  for (var i=0; i < numberOfSpaces; i++) {
    text = ' ' + text;
  }
  return text;
};

var indentCode = function(lines, numberOfSpaces) {
  var input = lines.split('\n');
  for (var i=0; i < input.length; i++) {
    input[i] = indentLine(input[i], numberOfSpaces);
  }
  return input.join('\n');
};

module.exports = function(filename, parserOutput) {
  var lines = [];

  lines.push('describe("' + parserOutput.name + '", function() {');

  parserOutput.describes.forEach(function(describe) {
    lines.push(indentLine('describe("' + describe.name + '", function() {', 2));

    describe.it.forEach(function(it) {
      lines.push(indentLine('it("' + it.name + '", function() {', 4));
      lines.push(indentCode(it.code, 6));
      lines.push(indentLine('});', 4));
    });

    lines.push(indentLine('});', 2));
  });

  lines.push('});');

  fs.writeFileSync(filename, lines.join('\n') + '\n', 'utf8');
};
