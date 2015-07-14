"use strict";

function Interpreter(name, config) {
  var self = this;

  this.name = name;
  this.tags = {};
  this.renderer = null;

  if (config) {
    Object.keys(config).forEach(function(tag) {
      var handler = config[tag];

      self.addTagHandler(tag, handler);
    });
  }
};

Interpreter.prototype = {
  addTagHandler: function(tag, handler) {
    this.tags[tag] = handler;
  },
  getHandler: function(tag) {
    var handler = this.tags[tag] || this.tags['*'];

    if (!handler) {
      throw new Error('JSX [' + tag + '] is not found and [*] is missing');
    }

    return handler;
  },
  hasCustomOverride: function(tag) {
    var handler = this.getHandler(tag);
    return !!handler.custom;
  },
  setRenderer: function(renderer) {
    this.renderer = renderer;
  },

  call: function(fn, args) {
    var val = this[fn].apply(this, args);

    if (typeof val === 'undefined') console.log('Interpreter call [' + fn + '] returned undefined');
    return val;
  },

  props: function(tag, props) {
    var handler = this.getHandler(tag);

    if (handler.props) {
      return handler.props.call(this.renderer, props, tag);
    }

    return props;
  },
  child: function(tag, parent, child) {
    var handler = this.getHandler(tag);

    if (handler.child) {
      return handler.child.call(this.renderer, child, parent, tag);
    }

    return parent;
  },
  enter: function(tag, props) {
    var handler = this.getHandler(tag);

    if (!handler.enter) {
      throw new Error('JSX Interpreter handler should provide [enter] method')
    }

    return handler.enter.call(this.renderer, tag, props);
  },
  leave: function(tag, parent) {
    var handler = this.getHandler(tag);

    if (handler.leave) {
      return handler.leave.call(this.renderer, parent, tag);
    }

    return parent;
  },
  custom: function(tag, fn, props, children) {
    var handler = this.getHandler(tag);

    return handler.custom.call(this.renderer, fn, props, children, tag);
  },
  children: function(tag, children, parent) {
    var handler = this.getHandler(tag);

    if (handler.children) {
      return handler.children.call(this.renderer, children, parent, tag);
    }

    return children;
  }
};

module.exports = Interpreter;