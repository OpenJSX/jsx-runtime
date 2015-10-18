"use strict";

var interpreters = {};
var registered = {};

var WILDCARD = [];

var overrides = {
  get: function(name) {
    return new Override(name);
  },
  register: function(name, interpreter, params) {
    var weight = (params && params.weight || 0);

    if (!isFinite(weight)) {
      weight = 0;
    }

    var data = {
      weight: weight,
      it: interpreter,
      time: Date.now()
    };

    if (name === '*') {
      WILDCARD.push(data);

      Object.keys(registered).forEach(function(key) {
        interpreters[key] = WILDCARD.concat(registered[key]).sort(sortRegister);
      });

      return;
    }

    var register = registered[name];

    if (!register) {
      register = registered[name] = [data];
    } else {
      register.push(data);
    }

    interpreters[name] = WILDCARD.concat(register).sort(sortRegister);
    // console.log(interpreters[name]);
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

  fragment: function(children) {
    var register = interpreters[this.name];
    var len = register.length;

    for (var i = 0; i < len; i++) {
      children = register[i].it.fragment(this.renderer, children);
    }

    return children;
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

    /*return register.reduce(function(fn, item) {
      return function() {
        return item.it.render(_this.renderer, fn);
      };
    }, fn);*/

    for (var i = 0; i < len; i++) {
      tmp = register[i].it.render(this.renderer, fn);

      (function(tmp) {
        fn = function() {
          return tmp;
        };
      }(tmp));
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
  child: function(tag, parent, child, index) {
    var register = interpreters[this.name];
    var len = register.length;

    for (var i = 0; i < len; i++) {
      child = register[i].it.child(this.renderer, tag, parent, child, index);

      if (child === null) {
        return null;
      }
    }

    return child;
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

function sortRegister(a, b) {
  if (a.weight < b.weight) {
    return -1;
  } else if (b.weight < a.weight) {
    return 1;
  } else {
    return a.time < b.time ? -1 : 1;
  }
}