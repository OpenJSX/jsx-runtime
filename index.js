"use strict";

var Renderer = require('./lib/renderer');
var Interpreter = require('./lib/interpreter');
var overrides = require('./lib/overrides');

var renderers = Object.create(null);

var jsx = {
  register: function register(name, config) {
    name = name.toLowerCase();

    if (renderers[name]) {
      throw new Error('Renderer [' + name + '] already exists');
    }

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

  _remove: function remove(name) {
    overrides.clear(name, renderers[name]);
    renderers[name] = null;
  },

  Stream: function Stream() {},
  Renderer: Renderer,
  Interpreter: Interpreter
};

module.exports = jsx;



