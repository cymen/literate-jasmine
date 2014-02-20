var assert = require('assert'),
    colors = require('colors'),
    sinon = require('sinon');

console.log('NOTE: Jasmine failure expected, watch for assertion failure!'.yellow);

(function referenceErrorInIt() {
  sinon.spy(console, 'log');
  sinon.stub(process, 'exit');

  process.argv[2] = __dirname + '/markdown/reference_it.md';
  require('../bin/literate-jasmine');

  setTimeout(function() {
    assert(console.log.calledWith('c = 2 * zz;'.yellow + '\t' + "// ERROR: 'zz' is not defined.".red));
    assert(console.log.calledWith('Parsed code failed to pass JSHint. Please correct errors indicated above.'.red));
    assert(process.exit.calledWith(1));

    console.log('NOTE: Jasmine failure expected, watch for assertion failure!'.yellow);
    console.log('\n');
  }, 250);
})();
