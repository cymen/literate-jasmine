var assert = require('assert'),
    colors = require('colors'),
    sinon = require('sinon');

sinon.spy(console, 'log');

(function referenceError() {
  try {
    process.argv[2] = __dirname + '/markdown/reference.md';
    require('../bin/literate-jasmine');
  }
  catch (e) {
    // swallow it so CI works
  }

  setTimeout(function() {
    assert(console.log.calledWith('ReferenceError: zz is not defined'.red, 'thrown from', 'c'.red + ':'));
    assert(console.log.calledWith('c = 2 * zz;'.red));
  }, 250);
})();
