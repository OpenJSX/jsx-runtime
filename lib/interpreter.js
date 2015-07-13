function Interpreter(name, config) {
  var self = this;

  this.name = name;
  this.tags = {};

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

  props: function(tag, props) {
    var handler = this.getHandler(tag);

    if (handler.props) {
      return handler.props(props, tag);
    }

    return props;
  },
  child: function(tag, parent, child) {
    var handler = this.getHandler(tag);

    if (handler.child) {
      return handler.child(child, parent, tag);
    }

    return parent;
  },
  enter: function(tag, props) {
    var handler = this.getHandler(tag);

    if (!handler.enter) {
      throw new Error('JSX Interpreter handler should provide [enter] method')
    }

    return handler.enter(tag, props);
  },
  leave: function(tag, parent) {
    var handler = this.getHandler(tag);

    if (handler.leave) {
      return handler.leave(parent, tag);
    }

    return parent;
  },
  custom: function(tag, fn, props, children) {
    var handler = this.getHandler(tag);

    return handler.custom(fn, props, children, tag);
  }
};

module.exports = Interpreter;