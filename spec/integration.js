var assert = require('assert'),
    colors = require('colors'),
    sinon = require('sinon');

sinon.spy(console, 'log');

(function referenceError() {
  console.log('NOTE: looks like failure but this is integration test -- failure expected, watch for assertion failure!'.yellow);

  process.argv[2] = __dirname + '/markdown/reference.md';
  require('../bin/literate-jasmine');

  setTimeout(function() {
    assert(console.log.calledWith('ReferenceError: zz is not defined'.red, 'thrown from', 'c'.red + ':'));
    assert(console.log.calledWith('c = 2 * zz;'.red));

    console.log('NOTE: looks like failure but this is integration test -- failure expected, watch for assertion failure!'.yellow);
    console.log('\n');
  }, 250);
})();
