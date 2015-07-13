var fs = require('fs');
var path = require('path');
var assert = require('assert');
var babel = require('babel-core');
var jsx = require('babel-plugin-jsx/gen');
var Module = require('module');

var testsFolder = path.join(__dirname, 'unit');
var dir = fs.readdirSync(testsFolder);

var plugin = jsx({
  captureScope: true
});

var modulePaths = module.paths;

describe('unit', function() {
  dir.forEach(function(fileName) {
    var filePath = path.join(testsFolder, fileName);
    var file = fs.readFileSync(filePath, 'utf-8');

    testFile(file, filePath, fileName);

    function testFile(file, filePath, fileName) {
      var result = babel.transform(file, {
        plugins: [plugin],
        blacklist: ['react']
      });

      var mod = requireString(result.code, filePath, fileName);

      if (mod.test) {
        it(fileName, mod.test);
      }
    }
  });
});

function requireString(src, filePath, fileName) {
  var module = new Module(fileName);

  module.filename = filePath;
  module.paths = Module._nodeModulePaths(path.dirname(filePath));
  module._compile(src, filePath);

  return module.exports;
}
