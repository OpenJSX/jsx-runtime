var fs = require('fs');
var path = require('path');
var assert = require('assert');
var babel = require('babel-core');
var jsx = require('babel-plugin-jsx/gen');
var Module = require('module');

var testsFolder = path.join(__dirname, 'unit');

var plugin = jsx({
  captureScope: true
});

var modulePaths = module.paths;

testDir(testsFolder);

function testDir(dirPath) {
  var dir = fs.readdirSync(dirPath);
  var dirName = path.basename(dirPath);

  describe(dirName, function() {
    dir.forEach(function(entryName) {
      var entryPath = path.join(dirPath, entryName);
      var stats = fs.statSync(entryPath);

      if (stats.isDirectory()) {
        testDir(entryPath);
      } else if (stats.isFile()) {
        testFile(entryPath, entryName);
      } else {
        throw new Error('Not supported FS entry');
      }
    });
  });
}

function testFile(filePath, fileName) {
  var file = fs.readFileSync(filePath, 'utf-8');
  var result = babel.transform(file, {
    plugins: [plugin],
    blacklist: ['react']
  });

  var mod = requireString(result.code, filePath, fileName);

  if (mod.tests) {
    context(fileName, function() {
      Object.keys(mod.tests).forEach(function(key) {
        it(key, mod.tests[key]);
      });
    });
  } else if (mod.test) {
    it(fileName, mod.test);
  }
}

function requireString(src, filePath, fileName) {
  var module = new Module(fileName);

  module.filename = filePath;
  module.paths = Module._nodeModulePaths(path.dirname(filePath));
  module._compile(src, filePath);

  return module.exports;
}