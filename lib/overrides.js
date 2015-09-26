"use strict";

var interpreters = {};

var overrides = {
  get: function(name) {
    return new Override(name);
  },
  register: function(name, interpreter, params) {
    var register = interpreters[name];
    var weight = (params && params.weight || 0);

    if (!isFinite(weight)) {
      weight = 0;
    }

    if (!register) {
      register = interpreters[name] = [];
    }

    // sort on register
    register.push({
      weight: weight,
      it: interpreter
    });
  }
};

function Override(name) {
  this.name = name;
  this.renderer = null;
}

Override.prototype = {
  setRenderer: function(renderer) {
    this.renderer = renderer;
  },

  // ################

  before: function(element) {
    var register = interpreters[this.name];
    var len = register.length;

    for (var i = 0; i < len; i++) {
      element = register[i].it.before(this.renderer, element);
    }

    return element;
  },

  after: function(element) {
    var register = interpreters[this.name];
    var len = register.length;

    for (var i = 0; i < len; i++) {
      element = register[i].it.after(this.renderer, element);
    }

    return element;
  },

  renderTo: function(element, target) {
    var register = interpreters[this.name];
    var len = register.length;

    for (var i = 0; i < len; i++) {
      element = register[i].it.renderTo(this.renderer, element, target);
    }

    return element;
  },

  render: function(fn) {
    var register = interpreters[this.name];
    var len = register.length;
    var tmp;

    for (var i = 0; i < len; i++) {
      tmp = register[i].it.render(this.renderer, fn);

      fn = function() {
        return tmp;
      };
    }

    return fn;
  },

  // ################

  props: function(tag, props) {
    var register = interpreters[this.name];
    var len = register.length;

    for (var i = 0; i < len; i++) {
      props = register[i].it.props(this.renderer, tag, props);
    }

    return props;
  },
  child: function(tag, parent, child) {
    var register = interpreters[this.name];
    var len = register.length;

    for (var i = 0; i < len; i++) {
      parent = register[i].it.child(this.renderer, tag, parent, child);
    }

    return parent;
  },
  enter: function(tag, props) {
    var register = interpreters[this.name];
    var len = register.length;

    for (var i = 0; i < len; i++) {
      tag = register[i].it.enter(this.renderer, tag, props);
    }

    return tag;
  },
  leave: function(tag, parent) {
    var register = interpreters[this.name];
    var len = register.length;

    for (var i = 0; i < len; i++) {
      parent = register[i].it.leave(this.renderer, tag, parent);
    }

    return parent;
  },
  custom: function(tag, fn, props, children) {
    var register = interpreters[this.name];
    var len = register.length;

    for (var i = 0; i < len; i++) {
      fn = register[i].it.custom(this.renderer, tag, fn, props, children);
    }

    return fn;
  },
  children: function(tag, children, parent) {
    var register = interpreters[this.name];
    var len = register.length;

    for (var i = 0; i < len; i++) {
      children = register[i].it.children(this.renderer, tag, children, parent);
    }

    return children;
  }
};

module.exports = overrides;