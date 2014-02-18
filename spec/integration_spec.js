var sys = require('sys'),
    exec = require('child_process').exec,
    path = require('path'),
    colors = require('colors'),
    isVerbose = process.argv[2] == '--verbose',
    _ = require('lodash');

var files = [
  "spec/integration_it.js",
  "spec/integration_it_async.js",
  "spec/integration_describe.js",
  "spec/integration_root.js"
];

_.each(files, function(file) {
  var filePath = path.join(process.cwd(), file);

  exec("node " + filePath, function(err, stdout, stderr) {
    if(err === null) {

      if(isVerbose) {
        console.log(stdout);
      }

      console.log(("Tested " + filePath).green);
    } else {
      console.log(("Failure in " + filePath).red + "\n");
      console.log(err.toString());

      process.exit(1);
    }
  });

});
