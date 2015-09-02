"use strict";

var Renderer = require('./lib/renderer');
var Interpreter = require('./lib/interpreter');
var overrides = require('./lib/overrides');

var renderers = {};

var jsx = {
  register: function registerRenderer(name, config) {
    name = name.toLowerCase();

    var interpreter = new Interpreter(config);
    var renderer = new Renderer(overrides.get(name));

    overrides.register(name, interpreter, {
      weight: 0
    });

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
  },

  override: function override(config, target) {
    if (!target) target = '*';

    var interpreter = new Interpreter(config);

    overrides.register(target, interpreter, {
      weight: 1
    });
  }
};

module.exports = jsx;



