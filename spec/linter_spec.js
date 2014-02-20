var linter = require('../src/linter'),
    colors = require('colors');

describe('linter', function() {
  it('returns false if the code does not pass jslint', function() {
    var code = "hi = 10;";

    expect(linter(code)).toBe(false);
  });

  it('displays the line with error in red', function() {
    spyOn(console, 'log').andCallThrough();
    var code = "hi = 10;";

    var isValid = linter(code);

    expect(isValid).toBe(false);
    expect(console.log).toHaveBeenCalledWith(code.yellow + '\t' + ("// ERROR: 'hi' is not defined.").red);
  });

  it('displays only the invalid line in red for multiple code lines', function() {
    spyOn(console, 'log').andCallThrough();
    var lines = [
        'var a = 10;',
        'b = 20;',
        'a += 1;'
      ],
      code = lines.join('\n');


    var isValid = linter(code);

    expect(isValid).toBe(false);
    expect(console.log).toHaveBeenCalledWith(lines[0]);
    expect(console.log).toHaveBeenCalledWith(lines[1].yellow + '\t' + ("// ERROR: 'b' is not defined.").red);
    expect(console.log).toHaveBeenCalledWith(lines[2]);
  });

  it('displays only the invalid lines in red if there are multiple errors', function() {
    spyOn(console, 'log').andCallThrough();
    var lines = [
        'var a = 10;',
        'b = 20;',
        'a *= 2;',
        'a += 1',
        'a = 0;'
      ],
      code = lines.join('\n');


    var isValid = linter(code);

    expect(isValid).toBe(false);
    expect(console.log).toHaveBeenCalledWith(lines[0]);
    expect(console.log).toHaveBeenCalledWith(lines[1].yellow + '\t' + ("// ERROR: 'b' is not defined.").red);
    expect(console.log).toHaveBeenCalledWith(lines[2]);
    expect(console.log).toHaveBeenCalledWith(lines[3].yellow + '\t' + ("// ERROR: Missing semicolon.").red);
    expect(console.log).toHaveBeenCalledWith(lines[4]);
  });
});
