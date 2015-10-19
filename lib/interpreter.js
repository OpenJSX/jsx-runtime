"use strict";

function Interpreter(config, weight) {
  var self = this;

  // weight == 0 is renderer
  // weight != 0 is overrider
  this.weight = weight;
  this.tags = {};
  this.calls = {
    before: config.before || this.dummy,
    after: config.after || this.dummy,
    fragment: config.fragment || this.dummy,
    render: config.render || this.fnDummy,
    renderTo: config.renderTo || this.renderToDummy
  };

  var tags = config && config.tags;
  var keys = tags && Object.keys(tags);

  if (!keys || !keys.length) return;

  for (var i = 0, len = keys.length; i < len; i++) {
    var tag = keys[i];
    var handler = tags[tag];

    self.addTagHandler(tag, handler);
  }
};

Interpreter.prototype = {
  addTagHandler: function(tag, handler) {
    this.tags[tag] = handler;
  },

  getHandler: function(tag) {
    var handler = this.tags[tag] || this.tags['*'];

    if (!handler) {
      if (!this.weight) {
        throw new Error('JSX [' + tag + '] is not found and [*] is missing');
      }

      handler = this.tags['*'] = {};
    }

    return handler;
  },

  getCall: function(call) {
    return this.calls[call];
  },

  dummy: function(a) { return a },
  fnDummy: function(fn) { return fn() },
  renderToDummy: function(_, result) { return result; },

  // ###########################

  before: function(renderer, element) {
    return this.getCall('before').call(renderer, element);
  },

  after: function(renderer, element) {
    return this.getCall('after').call(renderer, element);
  },

  fragment: function(renderer, children) {
    return this.getCall('fragment').call(renderer, children);
  },

  renderTo: function(renderer, element, target, next) {
    return this.getCall('renderTo').call(renderer, target, element, next);
  },

  render: function(renderer, fn) {
    return this.getCall('render').call(renderer, fn);
  },

  props: function(renderer, tag, props) {
    var handler = this.getHandler(tag);

    if (handler.props) {
      return handler.props.call(renderer, props, tag);
    }

    return props;
  },
  child: function(renderer, tag, parent, child, index) {
    var handler = this.getHandler(tag);

    if (handler.child) {
      return handler.child.call(renderer, child, parent, index, tag);
    }

    return child;
  },
  enter: function(renderer, tag, props) {
    var handler = this.getHandler(tag);

    if (!handler.enter) {
      if (!this.weight) {
        throw new Error('JSX Interpreter handler should provide [enter] method');
      }

      return tag;
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