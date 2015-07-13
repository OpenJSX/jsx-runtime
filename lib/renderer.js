var isArray = Array.isArray;
var hasOwn = Object.prototype.hasOwnProperty;

var MAX_ARRAY_DEPTH = 3;

function Renderer(interpreter, callbacks) {
  this.callBefore = callbacks && callbacks.before || this.noop;
  this.callAfter = callbacks && callbacks.after || this.noop;

  var _this = this;

  this.scope = null;
  this.interpreter = interpreter;
  this.render = function renderJSX(element, props, children) {
    if (!element) throw new Error('JSX element is not presented');

    if (typeof element === 'string') {
      element = {
        tag: element,
        props: isObject(props) ? props : null,
        children: Array.isArray(children) ? children : null
      };
    } else if (typeof element === 'function') {
      element = element({
        tag: [element.name || element.displayName || '', element],
        props: isObject(props) ? props : null,
        children: Array.isArray(children) ? children : null
      });
    }

    if (!_this.isTagDescriptor(element)) {
      throw new Error('Top level element should be a tag or function which returns a tag');
    }

    this.scope = {};

    element = _this.callBefore(element);
    element = _this.renderChild(element);
    element = _this.callAfter(element);

    this.scope = null;

    return element;
  };
};

Renderer.prototype = {
  renderChild: function(thing) {
    if (thing == null) {
      return null;
    }

    if (this.isTagDescriptor(thing)) {
      return this.handleTag(thing);
    }

    return thing;
  },
  walkChildren: function(children, handler, depth) {
    var length = children.length;
    var i = 0;
    var child;

    depth = depth | 0;

    for (; i < length; i++) {
      child = children[i];

      if (child == null) continue;
      if (isArray(child) && depth < MAX_ARRAY_DEPTH) {
        this.walkChildren(child, handler);
        continue;
      }

      handler(this.renderChild(child));
    }
  },

  handleTag: function(descriptor) {
    var tag = descriptor.tag;
    var props = descriptor.props;
    var children = descriptor.children;
    var parent;
    var tagFunction;

    if (isArray(tag)) {
      tagFunction = tag[1];
      tag = tag[0];

      var child;

      if (this.interpreter.hasCustomOverride(tag)) {
        child = this.interpreter.custom(tag, tagFunction, props, children);
      } else {
        child = tagFunction(props, children, tag);
      }

      return this.renderChild(child);
    }

    // Put children handling here if bottom-to-top handling is better

    props = props && this.interpreter.props(tag, props);
    parent = this.interpreter.enter(tag, props);

    if (isArray(children) && children.length) {
      parent = this.handleChildren(tag, children, parent);
    }

    parent = this.interpreter.leave(tag, parent);

    return parent;
  },

  handleChildren: function(tag, children, parent) {
    var self = this;

    this.walkChildren(children, function(child) {
      // probably move this to handleTag() method
      // and provide parentValue for renderChild() call
      parent = self.interpreter.child(tag, parent, child);
    });

    return parent;
  },
  handlePrivimite: function(thing) {
    return thing;
  },

  isPrimitive: function(thing) {
    switch (typeof thing) {
      case 'string':
      case 'boolean':
      case 'number':
        return true;
    }

    return false;
  },
  isTagDescriptor: function(object) {
    return object && typeof object === 'object' && 'tag' in object &&
      'props' in object && 'children' in object;
  },

  noop: function(a) { return a }
};

function isObject(obj) {
  return typeof obj === 'object' && obj && !isArray(obj);
}

module.exports = Renderer;