"use strict";

var Renderer = require('./lib/renderer');
var Interpreter = require('./lib/interpreter');
var overrides = require('./lib/overrides');

var renderers = {};

var jsx = {
  register: function registerRenderer(name, config) {
    name = name.toLowerCase();

    var interpreter = new Interpreter(config);
    var renderer = new Renderer(overrides.get(name), config.renderType);

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

  override: function override(config, target, weight) {
    if (!target) target = '*';

    var interpreter = new Interpreter(config);

    // Do not allow custom overrides to have 0 weight
    if (!weight || !isFinite(weight)) {
      weight = 1;
    }

    overrides.register(target, interpreter, {
      weight: weight
    });
  }
};

module.exports = jsx;



