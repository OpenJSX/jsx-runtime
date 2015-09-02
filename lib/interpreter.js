"use strict";

function Interpreter(config) {
  var self = this;

  this.tags = {};
  this.calls = {
    before: config.before || this.dummy,
    after: config.after || this.dummy,
    process: config.process || this.processDummy
  };

  var tags = config && config.tags;

  if (tags) {
    Object.keys(tags).forEach(function(tag) {
      var handler = tags[tag];

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

  getCall: function(call) {
    return this.calls[call];
  },

  dummy: function(a) { return a },
  processDummy: function(fn) { return fn() },

  // ###########################

  before: function(renderer, element) {
    return this.getCall('before').call(renderer, element);
  },

  after: function(renderer, element) {
    return this.getCall('after').call(renderer, element);
  },

  process: function(renderer, fn) {
    return this.getCall('process').call(renderer, fn);
  },

  props: function(renderer, tag, props) {
    var handler = this.getHandler(tag);

    if (handler.props) {
      return handler.props.call(renderer, props, tag);
    }

    return props;
  },
  child: function(renderer, tag, parent, child) {
    var handler = this.getHandler(tag);

    if (handler.child) {
      return handler.child.call(renderer, child, parent, tag);
    }

    return parent;
  },
  enter: function(renderer, tag, props) {
    var handler = this.getHandler(tag);

    if (!handler.enter) {
      throw new Error('JSX Interpreter handler should provide [enter] method')
    }

    return handler.enter.call(renderer, tag, props);
  },
  leave: function(renderer, tag, parent) {
    var handler = this.getHandler(tag);

    if (handler.leave) {
      return handler.leave.call(renderer, parent, tag);
    }

    return parent;
  },
  custom: function(renderer, tag, fn, props, children) {
    var handler = this.getHandler(tag);

    if (!handler.custom) {
      return fn(props, children, tag);
    }

    return handler.custom.call(renderer, fn, props, children, tag);
  },
  children: function(renderer, tag, children, parent) {
    var handler = this.getHandler(tag);

    if (handler.children) {
      return handler.children.call(renderer, children, parent, tag);
    }

    return children;
  }
};

module.exports = Interpreter;