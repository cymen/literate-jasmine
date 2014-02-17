var assert = require('assert'),
    colors = require('colors'),
    sinon = require('sinon');

console.log('NOTE: Jasmine failure expected, watch for assertion failure!'.yellow);

(function referenceErrorInIt() {
  sinon.spy(console, 'log');
  process.argv[2] = __dirname + '/markdown/reference_it.md';
  require('../bin/literate-jasmine');

  setTimeout(function() {
    assert(console.log.calledWith('ReferenceError: zz is not defined'.red, 'thrown from', 'c'.red + ':'));
    assert(console.log.calledWith('c = 2 * zz;'.red));

    console.log('NOTE: Jasmine failure expected, watch for assertion failure!'.yellow);
    console.log('\n');
  }, 250);
})();
