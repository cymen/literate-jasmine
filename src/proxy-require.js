var fs = require('fs'),
    stockRequire = require,
    localModules;

module.exports = function(config) {
  localModules = config.path;

  return function(name) {
    var path = process.cwd() + '/' + localModules + '/' + name;

    if (fs.existsSync(path)) {
      name = path;
    }

    return stockRequire(name);
  };
};
