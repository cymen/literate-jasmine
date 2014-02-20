var assert = require('assert'),
    colors = require('colors'),
    sinon = require('sinon');

console.log('NOTE: Jasmine failure expected, watch for assertion failure!'.yellow);

(function referenceErrorInDescribeBeforeEach() {
  sinon.spy(console, 'log');
  sinon.stub(process, 'exit');

  process.argv[2] = __dirname + '/markdown/reference_describe.md';
  require('../bin/literate-jasmine');

  setTimeout(function() {
    assert(console.log.calledWith('c = 20 * d;'.yellow + '\t' + "// ERROR: 'd' is not defined.".red));
    assert(console.log.calledWith('Parsed code failed to pass JSHint. Please correct errors indicated above.'.red));
    assert(process.exit.calledWith(1));

    console.log('NOTE: Jasmine failure expected, watch for assertion failure!'.yellow);
    console.log('\n');
  }, 250);
})();
