var require = require('../src/proxy-require')({
  path: 'spec/local_modules'
});

describe('proxy require', function() {
  it('uses the local module', function() {
    var inspector = require('brains');

    expect(inspector).toBe('BIG BRAINS');
  });
});
