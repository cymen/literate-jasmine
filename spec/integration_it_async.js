var assert = require('assert'),
    colors = require('colors'),
    sinon = require('sinon');

console.log('NOTE: Jasmine failure expected, watch for assertion failure!'.yellow);

(function referenceErrorInIt() {
  sinon.spy(console, 'log');
  process.argv[2] = __dirname + '/markdown/reference_it_async.md';
  require('../bin/literate-jasmine');

  setTimeout(function() {
    assert(console.log.calledWith('hello'));
    assert(console.log.calledWith('inside'));

    console.log('NOTE: Jasmine failure expected, watch for assertion failure!'.yellow);
    console.log('\n');
  }, 250);
})();
