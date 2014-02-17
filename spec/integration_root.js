var assert = require('assert'),
    colors = require('colors'),
    sinon = require('sinon');

console.log('NOTE: Jasmine failure expected, watch for assertion failure!'.yellow);

(function referenceErrorInRootGlobal() {
  sinon.spy(console, 'log');
  try {
    process.argv[2] = __dirname + '/markdown/reference_root.md';
    require('../bin/literate-jasmine');
  }
  catch (e) {
    // swallow for purpose of integration test -- for real failure, we are fine with
    // throwing the exception!
  }

  setTimeout(function() {
    assert(console.log.calledWith('ReferenceError: xyz is not defined'.red, 'thrown from', 'a'.red, 'in', './spec/markdown/reference_root.md'.red + ':'));
    assert(console.log.calledWith('var c = xyz;'.red));

    console.log('NOTE: Jasmine failure expected, watch for assertion failure!'.yellow);
    console.log('\n');
  }, 250);
})();
