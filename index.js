"use strict";

var Renderer = require('./renderer');
var Interpreter = require('./interpreter');

var interpreters = {};

var jsx = {
  register: function registerInterpreter(name, config) {
    name = name.toLowerCase();
    interpreters[name] = new Interpreter(name, config);
  },

  render: function renderJSXTree(tree, interpreter) {
    interpreter = interpreter.toLowerCase();
    interpreter = interpreter && interpreters[interpreter];

    if (!interpreter) {
      throw new Error('Interpreter [' + interpreter + '] not found');
    }

    var renderer = new Renderer(interpreter);
    return renderer.render(tree);
  }
};

module.exports = jsx;



