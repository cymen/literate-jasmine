var assert = require('assert'),
    colors = require('colors'),
    sinon = require('sinon');

console.log('NOTE: Jasmine failure expected, watch for assertion failure!'.yellow);

(function referenceErrorInDescribeBeforeEach() {
  sinon.spy(console, 'log');
  process.argv[2] = __dirname + '/markdown/reference_describe.md';
  require('../bin/literate-jasmine');

  setTimeout(function() {
    assert(console.log.calledWith('ReferenceError: d is not defined'.red, 'thrown from', 'b'.red, 'in', './spec/markdown/reference_describe.md'.red + ':'));
    assert(console.log.calledWith('c = 20 * d;'.red));

    console.log('NOTE: Jasmine failure expected, watch for assertion failure!'.yellow);
    console.log('\n');
  }, 250);
})();
