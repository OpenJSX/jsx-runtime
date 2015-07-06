"use strict";

var Renderer = require('./renderer');
var Interpreter = require('./interpreter');

var renderers = {};

var jsx = {
  register: function registerRenderer(name, config) {
    name = name.toLowerCase();

    var interpreter = new Interpreter(name, config);
    var renderer = new Renderer(interpreter);

    renderers[name] = renderer;
    return renderer;
  },

  render: function renderJSXTree(tree, renderer) {
    renderer = renderer.toLowerCase();
    renderer = renderer && renderers[renderer];

    if (!renderer) {
      throw new Error('Renderer [' + renderer + '] not found');
    }

    return renderer.render(tree);
  }
};

module.exports = jsx;



