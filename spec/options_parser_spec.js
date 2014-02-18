var opts = require('../src/options_parser'),
    path = require('path');

describe('options parser', function() {
  var binFile = path.join(process.cwd(), 'bin', 'literate-jasmine');

  it('identifies a verbose flag', function() {
    var args = [ '--verbose' ],
      result = opts.parse(args);

    expect(result.isVerbose).toBe(true);
  });

  it('returns false if no verbose flag is provided', function() {
    var args = [],
        result = opts.parse(args);

    expect(result.isVerbose).toBe(false);
  });

  it('gives a list of paths for runner to execute', function() {
    var args = [ "first-path", "second-path" ],
        result = opts.parse(args);

    expect(result.paths).toEqual([
      "first-path",
      "second-path"
    ]);
  });

  it('uses the current directory as the path if no paths given', function() {
    spyOn(process, "cwd").andReturn("fake-current-dir");

    var args = ["--verbose"];
    expect(opts.parse(args).paths).toEqual(["fake-current-dir"]);
  });

  it('sets color to false if the no-color flag is provided', function() {
    var args = ["--no-color"];
    expect(opts.parse(args).color).toBe(false);
  });

  it('defaults color to true', function() {
    var args = [];
    expect(opts.parse(args).color).toBe(true);
  });
});
