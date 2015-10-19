"use strict";

var Renderer = require('./lib/renderer');
var Interpreter = require('./lib/interpreter');
var overrides = require('./lib/overrides');

var renderers = {};

var jsx = {
  register: function registerRenderer(name, config) {
    name = name.toLowerCase();

    var weight = 0;
    var interpreter = new Interpreter(config, weight);
    var renderer = new Renderer(overrides.get(name), config.params || {});

    overrides.register(name, interpreter, {
      weight: weight
    });

    renderers[name] = renderer;
    return renderer;
  },

  override: function override(config, target, weight) {
    if (!target) target = '*';

    // Do not allow custom overrides to have 0 weight
    if (!weight || !isFinite(weight)) {
      weight = 1;
    }

    var interpreter = new Interpreter(config, weight);

    overrides.register(target, interpreter, {
      weight: weight
    });
  },

  Stream: function() {},
  Renderer: Renderer,
  Interpreter: Interpreter
};

module.exports = jsx;



